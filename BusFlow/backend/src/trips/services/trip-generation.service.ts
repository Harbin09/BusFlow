import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { RuleEngineService, RuleContext } from '../../rule-engine';
import { TripsService } from './trips.service';
import { StudentTripAssignmentService } from './student-trip-assignment.service';
import {
  CapacityEvaluator,
  DriverAvailabilityEvaluator,
  TimetableEvaluator,
} from '../../rule-engine';

/**
 * Result of a trip generation attempt
 */
export interface TripGenerationResult {
  routeId: string;
  busId: string;
  driverId: string;
  departureTime: Date;
  approved: boolean;
  reason?: string;
  tripId?: string;
  studentAssignments?: {
    assigned: number;
    skipped: number;
    total: number;
  };
  errorDetails?: Record<string, unknown>;
}

/**
 * TripGenerationService orchestrates the trip generation workflow
 *
 * Flow:
 * 1. Fetch required data from Prisma
 * 2. Build RuleContext objects for each potential trip
 * 3. Execute RuleEngine for each context
 * 4. Create Trip records if approved
 * 5. Return results
 */
@Injectable()
export class TripGenerationService {
  private readonly logger = new Logger(TripGenerationService.name);
  private ruleEngine: RuleEngineService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tripsService: TripsService,
    private readonly assignmentService: StudentTripAssignmentService,
    ruleEngine: RuleEngineService,
  ) {
    this.ruleEngine = ruleEngine;
    this.setupRuleEngine();
  }

  /**
   * Initialize rule engine with evaluators
   */
  private setupRuleEngine(): void {
    // Clear any existing rules (in case of re-initialization)
    this.ruleEngine.clearRules();

    // Register evaluators in order of priority
    this.ruleEngine.registerRules([
      new TimetableEvaluator(),
      new CapacityEvaluator(),
      new DriverAvailabilityEvaluator(),
    ]);

    this.logger.debug('[TripGeneration] Rule Engine initialized with evaluators');
  }

  /**
   * Generate trips for a given date
   *
   * Implements:
   * - Resource allocation (buses/drivers removed from pool after assignment)
   * - Transaction safety (all trips created atomically or none)
   * - Duplicate generation protection (checks by timetable)
   *
   * @param date The date to generate trips for
   * @returns Array of trip generation results
   */
  async generateTripsForDate(date: Date): Promise<TripGenerationResult[]> {
    this.logger.log(
      `[TripGeneration] Starting trip generation for ${date.toISOString()}`,
    );

    const results: TripGenerationResult[] = [];

    try {
      // Step 1: Validate date
      if (!this.isValidDate(date)) {
        throw new BadRequestException('Invalid date provided');
      }

      // Step 2: Fetch operational data
      this.logger.debug('[TripGeneration] Fetching operational data...');
      const timetables = await this.fetchTimetablesForDate(date);
      const routes = await this.fetchRoutes();
      const students = await this.fetchStudents(date);
      const buses = await this.fetchActiveBuses();
      const drivers = await this.fetchAvailableDrivers(date);

      this.logger.debug(
        `[TripGeneration] Data fetched: ${timetables.length} timetables, ${routes.length} routes, ${buses.length} buses, ${drivers.length} drivers`,
      );

      // Step 3: Check for holidays
      const isHoliday = await this.isHoliday(date);

      // FIX 1: Create mutable resource pools for allocation tracking
      const availableBuses = [...buses];
      const availableDrivers = [...drivers];
      const tripsToCreate: Array<{
        timetable: any;
        bus: any;
        driver: any;
        routeStudents: any[];
        context: any;
      }> = [];

      // Step 4: Generate potential trips from timetables
      for (const timetable of timetables) {
        try {
          // Skip if no students for this route
          const routeStudents = students.filter((s) => s.routeId === timetable.routeId);
          if (routeStudents.length === 0) {
            this.logger.debug(
              `[TripGeneration] No students for route ${timetable.routeId}, skipping`,
            );
            continue;
          }

          // FIX 3: Check if trip already exists by timetable
          const tripAlreadyExists = await this.prisma.trip.findFirst({
            where: {
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate() + 1,
                ),
              },
              route: {
                timetables: {
                  some: {
                    id: timetable.id,
                  },
                },
              },
            },
          });

          if (tripAlreadyExists) {
            this.logger.debug(
              `[TripGeneration] Trip already exists for timetable ${timetable.id}`,
            );
            results.push({
              routeId: timetable.routeId,
              busId: '',
              driverId: '',
              departureTime: timetable.startTime,
              approved: false,
              reason: 'Duplicate trip generation prevented',
            });
            continue;
          }

          // FIX 1: Select bus from available pool and remove it
          const selectedBus = availableBuses.find((b) => b.status === 'ACTIVE');
          if (!selectedBus) {
            results.push({
              routeId: timetable.routeId,
              busId: '',
              driverId: '',
              departureTime: timetable.startTime,
              approved: false,
              reason: 'No available buses (all allocated or inactive)',
            });
            continue;
          }

          // FIX 1: Select driver from available pool and remove it
          const selectedDriver = availableDrivers[0];
          if (!selectedDriver) {
            results.push({
              routeId: timetable.routeId,
              busId: selectedBus.id,
              driverId: '',
              departureTime: timetable.startTime,
              approved: false,
              reason: 'No available drivers (all allocated)',
            });
            continue;
          }

          // Step 5: Build RuleContext
          const context = this.buildRuleContext(
            date,
            timetable,
            selectedBus,
            selectedDriver,
            routeStudents,
            availableDrivers,
            isHoliday,
          );

          // Step 6: Execute RuleEngine
          this.logger.debug(
            `[TripGeneration] Evaluating trip for route ${timetable.routeId}`,
          );
          const decision = await this.ruleEngine.evaluate(context);

          if (decision.approved) {
            // FIX 1: Remove allocated resources from pools
            const busIndex = availableBuses.findIndex((b) => b.id === selectedBus.id);
            if (busIndex > -1) {
              availableBuses.splice(busIndex, 1);
            }

            const driverIndex = availableDrivers.findIndex(
              (d) => d.id === selectedDriver.id,
            );
            if (driverIndex > -1) {
              availableDrivers.splice(driverIndex, 1);
            }

            // Add to batch creation list
            tripsToCreate.push({
              timetable,
              bus: selectedBus,
              driver: selectedDriver,
              routeStudents,
              context,
            });

            results.push({
              routeId: timetable.routeId,
              busId: selectedBus.id,
              driverId: selectedDriver.id,
              departureTime: timetable.startTime,
              approved: true,
              tripId: `pending-${timetable.id}`, // Placeholder, will be updated after transaction
            });

            this.logger.log(
              `[TripGeneration] ✓ Trip approved for route ${timetable.routeId} (pending creation)`,
            );
          } else {
            // Step 8: Log rejection
            const reason = decision.criticalFailures
              .map((f) => f.message)
              .join('; ');

            results.push({
              routeId: timetable.routeId,
              busId: selectedBus.id,
              driverId: selectedDriver.id,
              departureTime: timetable.startTime,
              approved: false,
              reason,
              errorDetails: {
                criticalFailures: decision.criticalFailures.map((f) => ({
                  rule: f.ruleName,
                  message: f.message,
                })),
              },
            });

            this.logger.warn(
              `[TripGeneration] ✗ Trip rejected for route ${timetable.routeId}: ${reason}`,
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `[TripGeneration] Error processing timetable ${timetable.id}: ${errorMessage}`,
          );

          results.push({
            routeId: timetable.routeId,
            busId: '',
            driverId: '',
            departureTime: timetable.startTime,
            approved: false,
            reason: `Processing error: ${errorMessage}`,
          });
        }
      }

      // FIX 2: Create all approved trips in a transaction
      if (tripsToCreate.length > 0) {
        this.logger.debug(
          `[TripGeneration] Creating ${tripsToCreate.length} trips in transaction...`,
        );

        try {
          const createdTrips = await this.prisma.$transaction(
            tripsToCreate.map((tripData) =>
              this.prisma.trip.create({
                data: {
                  route: { connect: { id: tripData.timetable.routeId } },
                  bus: { connect: { id: tripData.bus.id } },
                  driver: { connect: { id: tripData.driver.id } },
                  date: date,
                  departureTime: tripData.timetable.startTime,
                  arrivalTime: tripData.timetable.endTime,
                  status: 'SCHEDULED',
                  generatedByRuleEngine: true,
                },
                include: {
                  route: true,
                  bus: true,
                  driver: true,
                },
              }),
            ),
          );

          // Update results with actual trip IDs and assign students
          for (let i = 0; i < createdTrips.length; i++) {
            const trip = createdTrips[i];
            const resultIndex = results.findIndex(
              (r) => r.approved && r.tripId === `pending-${tripsToCreate[i].timetable.id}`,
            );

            if (resultIndex > -1) {
              results[resultIndex].tripId = trip.id;

              // Assign students to the trip
              try {
                const assignmentResults = await this.assignmentService.assignStudentsToTrip(
                  trip.id,
                  trip.date,
                );

                const assigned = assignmentResults.filter(r => r.assigned).length;
                const skipped = assignmentResults.filter(r => !r.assigned).length;

                results[resultIndex].studentAssignments = {
                  assigned,
                  skipped,
                  total: assignmentResults.length,
                };

                this.logger.log(
                  `[TripGeneration] ✓ Assigned ${assigned}/${assignmentResults.length} students to trip ${trip.id}`,
                );
              } catch (assignmentError) {
                const errorMessage =
                  assignmentError instanceof Error
                    ? assignmentError.message
                    : String(assignmentError);

                this.logger.warn(
                  `[TripGeneration] Student assignment error for trip ${trip.id}: ${errorMessage}`,
                );

                results[resultIndex].studentAssignments = {
                  assigned: 0,
                  skipped: 0,
                  total: 0,
                };
              }
            }
          }

          this.logger.log(
            `[TripGeneration] ✓ All ${createdTrips.length} trips created successfully with student assignments`,
          );
        } catch (transactionError) {
          const errorMessage =
            transactionError instanceof Error
              ? transactionError.message
              : String(transactionError);

          this.logger.error(
            `[TripGeneration] Transaction failed, rolling back: ${errorMessage}`,
          );

          // Mark all approved results as failed due to transaction rollback
          results.forEach((result) => {
            if (result.approved) {
              result.approved = false;
              result.reason = `Transaction failed: ${errorMessage}`;
              delete result.tripId;
            }
          });

          throw transactionError;
        }
      }

      // Summary
      const approved = results.filter((r) => r.approved).length;
      const rejected = results.filter((r) => !r.approved).length;
      this.logger.log(
        `[TripGeneration] Complete. ${approved} approved, ${rejected} rejected`,
      );

      return results;
    } catch (error) {
      this.logger.error(`[TripGeneration] Fatal error: ${error}`);
      throw error;
    }
  }

  /**
   * Build RuleContext from operational data
   */
  private buildRuleContext(
    date: Date,
    timetable: any,
    bus: any,
    driver: any,
    routeStudents: any[],
    allDrivers: any[],
    isHoliday: boolean,
  ): RuleContext {
    return new RuleContext({
      date,
      routeId: timetable.routeId,
      busId: bus.id,
      busCapacity: bus.capacity,
      driverId: driver.id,
      departureTime: timetable.startTime,
      arrivalTime: timetable.endTime,
      assignedStudentIds: routeStudents.map((s) => s.id),
      availableDriverIds: allDrivers.map((d) => d.id),
      estimatedDurationMinutes: this.calculateDurationMinutes(
        timetable.startTime,
        timetable.endTime,
      ),
      timetableType: timetable.type,
      isHoliday,
    });
  }

  /**
   * Create a Trip record in the database
   */
  private async createTripRecord(
    timetable: any,
    busId: string,
    driverId: string,
    date: Date,
  ) {
    return await this.tripsService.createTrip({
      route: { connect: { id: timetable.routeId } },
      bus: { connect: { id: busId } },
      driver: { connect: { id: driverId } },
      date,
      departureTime: timetable.startTime,
      arrivalTime: timetable.endTime,
      status: 'SCHEDULED',
      generatedByRuleEngine: true,
    });
  }

  /**
   * Fetch timetables for a given date
   */
  private async fetchTimetablesForDate(date: Date) {
    return await this.prisma.timetable.findMany({
      where: {
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      include: { route: true },
    });
  }

  /**
   * Fetch all routes
   */
  private async fetchRoutes() {
    return await this.prisma.route.findMany({
      include: { stops: true },
    });
  }

  /**
   * Fetch students for the given date (with daily status = PRESENT)
   */
  private async fetchStudents(date: Date) {
    return await this.prisma.student.findMany({
      where: {
        dailyStatus: {
          some: {
            date: {
              gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              lt: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 1,
              ),
            },
            status: 'PRESENT',
          },
        },
      },
      include: { route: true, pickupStop: true },
    });
  }

  /**
   * Fetch active buses
   */
  private async fetchActiveBuses() {
    return await this.prisma.bus.findMany({
      where: { status: 'ACTIVE' },
      include: { liveStatus: true },
    });
  }

  /**
   * Fetch available drivers (not assigned to other trips on this date)
   */
  private async fetchAvailableDrivers(date: Date) {
    // Get all drivers
    const allDrivers = await this.prisma.driver.findMany({
      include: { user: true },
    });

    // Get drivers already assigned to trips on this date
    const assignedDrivers = await this.prisma.trip.findMany({
      where: {
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      select: { driverId: true },
    });

    const assignedDriverIds = assignedDrivers.map((t) => t.driverId);

    // Return drivers not already assigned
    return allDrivers.filter((d) => !assignedDriverIds.includes(d.id));
  }

  /**
   * Check if a date is a holiday
   */
  private async isHoliday(date: Date): Promise<boolean> {
    // Future: integrate with HolidayCalendar model
    // For now, return false
    return false;
  }

  /**
   * Validate that the date is a valid date object
   */
  private isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Calculate duration in minutes between two dates
   */
  private calculateDurationMinutes(start: Date, end?: Date): number {
    if (!end) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }
}
