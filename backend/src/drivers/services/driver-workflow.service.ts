import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { TrackingService } from '../../tracking/services/tracking.service';
import { TripStatus, StudentTripAssignmentStatus } from '@prisma/client';

export interface TodaysTripResult {
  id: string;
  routeId: string;
  busId: string;
  date: Date;
  departureTime: Date;
  arrivalTime?: Date;
  status: TripStatus;
  route: {
    id: string;
    name: string;
  };
  bus: {
    id: string;
    plateNumber: string;
    capacity: number;
  };
}

export interface PassengerItem {
  assignmentId: string;
  studentId: string;
  studentNo: string;
  studentName: string;
  boardingStop?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  status: StudentTripAssignmentStatus;
  boardingTime?: Date;
  alightingTime?: Date;
}

/**
 * DriverWorkflowService handles driver-specific operations
 *
 * Responsibilities:
 * - Get driver's assigned trips
 * - Start/end trip workflows
 * - Retrieve passenger lists
 * - Enforce driver authorization
 */
@Injectable()
export class DriverWorkflowService {
  private readonly logger = new Logger(DriverWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  /**
   * Get driver's assigned trip for today
   *
   * @param driverId The driver ID
   * @returns Today's trip or null if not assigned
   * @throws ForbiddenException if trip is not for this driver
   */
  async getTodayTrip(driverId: string): Promise<TodaysTripResult | null> {
    this.logger.debug(`[DriverWorkflow] Getting today's trip for driver ${driverId}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trip = await this.prisma.trip.findFirst({
      where: {
        driverId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
          },
        },
      },
    });

    if (!trip) {
      this.logger.debug(
        `[DriverWorkflow] No trip assigned for driver ${driverId} today`,
      );
      return null;
    }

    this.logger.log(
      `[DriverWorkflow] ✓ Found trip ${trip.id} for driver ${driverId}`,
    );

    return {
      id: trip.id,
      routeId: trip.routeId,
      busId: trip.busId,
      date: trip.date,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime || undefined,
      status: trip.status,
      route: trip.route,
      bus: trip.bus,
    };
  }

  /**
   * Start a trip (change SCHEDULED → IN_PROGRESS and activate tracking)
   *
   * @param driverId Driver performing the action
   * @param tripId Trip to start
   */
  async startTrip(driverId: string, tripId: string): Promise<void> {
    this.logger.log(`[DriverWorkflow] Driver ${driverId} starting trip ${tripId}`);

    try {
      // Step 1: Verify trip exists and belongs to driver
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new NotFoundException(`Trip ${tripId} not found`);
      }

      if (trip.driverId !== driverId) {
        this.logger.warn(
          `[DriverWorkflow] Driver ${driverId} attempted to start trip ${tripId} assigned to ${trip.driverId}`,
        );
        throw new ForbiddenException('This trip is not assigned to you');
      }

      // Step 2: Verify trip is in correct status
      if (trip.status !== TripStatus.SCHEDULED) {
        throw new BadRequestException(
          `Trip is ${trip.status}. Only SCHEDULED trips can be started.`,
        );
      }

      // Step 3: Update trip status
      await this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.IN_PROGRESS },
      });

      this.logger.debug(`[DriverWorkflow] Trip ${tripId} status updated to IN_PROGRESS`);

      // Step 4: Activate tracking
      await this.trackingService.startTracking(tripId);

      this.logger.log(`[DriverWorkflow] ✓ Trip ${tripId} started successfully`);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflow] Error starting trip: ${errorMessage}`,
      );
      throw new BadRequestException(`Failed to start trip: ${errorMessage}`);
    }
  }

  /**
   * End a trip (change IN_PROGRESS → COMPLETED and stop tracking)
   *
   * @param driverId Driver performing the action
   * @param tripId Trip to end
   */
  async endTrip(driverId: string, tripId: string): Promise<void> {
    this.logger.log(`[DriverWorkflow] Driver ${driverId} ending trip ${tripId}`);

    try {
      // Step 1: Verify trip exists and belongs to driver
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new NotFoundException(`Trip ${tripId} not found`);
      }

      if (trip.driverId !== driverId) {
        this.logger.warn(
          `[DriverWorkflow] Driver ${driverId} attempted to end trip ${tripId} assigned to ${trip.driverId}`,
        );
        throw new ForbiddenException('This trip is not assigned to you');
      }

      // Step 2: Verify trip is in correct status
      if (trip.status !== TripStatus.IN_PROGRESS) {
        throw new BadRequestException(
          `Trip is ${trip.status}. Only IN_PROGRESS trips can be ended.`,
        );
      }

      // Step 3: Stop tracking
      await this.trackingService.stopTracking(tripId);

      this.logger.debug(`[DriverWorkflow] Tracking stopped for trip ${tripId}`);

      // Step 4: Update trip status
      await this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED },
      });

      this.logger.log(`[DriverWorkflow] ✓ Trip ${tripId} completed successfully`);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflow] Error ending trip: ${errorMessage}`,
      );
      throw new BadRequestException(`Failed to end trip: ${errorMessage}`);
    }
  }

  /**
   * Get passenger list for a trip
   *
   * @param driverId Driver performing the action
   * @param tripId Trip to get passengers for
   * @returns List of passengers with pickup stops
   */
  async getPassengerList(driverId: string, tripId: string): Promise<PassengerItem[]> {
    this.logger.debug(
      `[DriverWorkflow] Getting passenger list for trip ${tripId}`,
    );

    try {
      // Step 1: Verify trip exists and belongs to driver
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new NotFoundException(`Trip ${tripId} not found`);
      }

      if (trip.driverId !== driverId) {
        this.logger.warn(
          `[DriverWorkflow] Driver ${driverId} attempted to view passengers for trip ${tripId} assigned to ${trip.driverId}`,
        );
        throw new ForbiddenException('This trip is not assigned to you');
      }

      // Step 2: Fetch assignments with student and stop info
      const assignments = await this.prisma.studentTripAssignment.findMany({
        where: { tripId },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          boardingStop: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.log(
        `[DriverWorkflow] ✓ Retrieved ${assignments.length} passengers for trip ${tripId}`,
      );

      // Step 3: Transform to response format
      return assignments.map(a => ({
        assignmentId: a.id,
        studentId: a.student.id,
        studentNo: a.student.studentNo,
        studentName: a.student.user.name,
        boardingStop: a.boardingStop ? {
          id: a.boardingStop.id,
          name: a.boardingStop.name,
          latitude: a.boardingStop.latitude,
          longitude: a.boardingStop.longitude,
        } : undefined,
        status: a.status,
        boardingTime: a.boardingTime || undefined,
        alightingTime: a.alightingTime || undefined,
      }));
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflow] Error getting passenger list: ${errorMessage}`,
      );
      throw new BadRequestException(
        `Failed to get passenger list: ${errorMessage}`,
      );
    }
  }

  /**
   * Get count of expected passengers (for capacity check)
   */
  async getExpectedPassengerCount(tripId: string): Promise<number> {
    return await this.prisma.studentTripAssignment.count({
      where: { tripId },
    });
  }

  /**
   * Get count of active passengers (boarded/alighted)
   */
  async getActivePassengerCount(tripId: string): Promise<number> {
    return await this.prisma.studentTripAssignment.count({
      where: {
        tripId,
        status: {
          in: ['SCHEDULED', 'BOARDED', 'ALIGHTED'],
        },
      },
    });
  }
}
