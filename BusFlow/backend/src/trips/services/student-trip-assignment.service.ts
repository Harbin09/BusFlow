import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { StudentDailyStatusType } from '@prisma/client';

/**
 * Result of assigning a student to a trip
 */
export interface StudentAssignmentResult {
  studentId: string;
  tripId: string;
  assigned: boolean;
  reason?: string;
  assignmentId?: string;
}

/**
 * StudentTripAssignmentService handles assignment of students to trips
 *
 * Flow:
 * 1. Trip is created and approved
 * 2. Find all students on the trip's route
 * 3. Check student daily status for eligibility
 * 4. Create assignment for eligible students
 * 5. Handle conflicts and errors
 */
@Injectable()
export class StudentTripAssignmentService {
  private readonly logger = new Logger(StudentTripAssignmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign students to a trip
   *
   * @param tripId The trip to assign students to
   * @param date The date of the trip
   * @returns Array of assignment results
   */
  async assignStudentsToTrip(tripId: string, date: Date): Promise<StudentAssignmentResult[]> {
    this.logger.log(
      `[StudentAssignment] Starting assignment for trip ${tripId} on ${date.toISOString()}`,
    );

    const results: StudentAssignmentResult[] = [];

    try {
      // Step 1: Fetch the trip with route information
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          route: true,
          bus: true,
        },
      });

      if (!trip) {
        this.logger.warn(`[StudentAssignment] Trip ${tripId} not found`);
        throw new Error(`Trip ${tripId} not found`);
      }

      this.logger.debug(
        `[StudentAssignment] Found trip for route ${trip.routeId}, bus capacity: ${trip.bus.capacity}`,
      );

      // Step 2: Find all students assigned to this route
      const routeStudents = await this.prisma.student.findMany({
        where: {
          routeId: trip.routeId,
        },
        include: {
          dailyStatus: {
            where: {
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
              },
            },
          },
        },
      });

      this.logger.debug(
        `[StudentAssignment] Found ${routeStudents.length} students on route ${trip.routeId}`,
      );

      if (routeStudents.length === 0) {
        this.logger.warn(
          `[StudentAssignment] No students found for route ${trip.routeId}`,
        );
        return results;
      }

      // Step 3: Process each student
      const safeCapacity = Math.floor(trip.bus.capacity * 0.9);
      let assignedCount = 0;

      for (const student of routeStudents) {
        try {
          // Check capacity constraint
          if (assignedCount >= safeCapacity) {
            results.push({
              studentId: student.id,
              tripId,
              assigned: false,
              reason: `Bus capacity exceeded (${assignedCount}/${safeCapacity})`,
            });
            this.logger.debug(
              `[StudentAssignment] Skipping student ${student.id}: capacity exceeded`,
            );
            continue;
          }

          // Check if already assigned (duplicate prevention)
          const existingAssignment = await this.prisma.studentTripAssignment.findUnique({
            where: {
              studentId_tripId: {
                studentId: student.id,
                tripId,
              },
            },
          });

          if (existingAssignment) {
            results.push({
              studentId: student.id,
              tripId,
              assigned: false,
              reason: 'Student already assigned to this trip',
            });
            this.logger.debug(
              `[StudentAssignment] Skipping student ${student.id}: already assigned`,
            );
            continue;
          }

          // Check daily status for eligibility
          const dailyStatus = student.dailyStatus[0];

          if (!dailyStatus) {
            results.push({
              studentId: student.id,
              tripId,
              assigned: false,
              reason: 'No daily status found for this date',
            });
            this.logger.debug(
              `[StudentAssignment] Skipping student ${student.id}: no daily status`,
            );
            continue;
          }

          // Determine eligibility based on status
          const eligibleStatuses: StudentDailyStatusType[] = [
            'PRESENT',
            'LATE_PICKUP',
          ];

          if (!eligibleStatuses.includes(dailyStatus.status)) {
            results.push({
              studentId: student.id,
              tripId,
              assigned: false,
              reason: `Student marked as ${dailyStatus.status}`,
            });
            this.logger.debug(
              `[StudentAssignment] Skipping student ${student.id}: status ${dailyStatus.status}`,
            );
            continue;
          }

          // Create assignment
          const assignment = await this.prisma.studentTripAssignment.create({
            data: {
              studentId: student.id,
              tripId,
              status: 'SCHEDULED',
              boardingStopId: student.pickupStopId || undefined,
            },
          });

          assignedCount++;

          results.push({
            studentId: student.id,
            tripId,
            assigned: true,
            assignmentId: assignment.id,
          });

          this.logger.debug(
            `[StudentAssignment] ✓ Assigned student ${student.id} to trip ${tripId}`,
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `[StudentAssignment] Error assigning student ${student.id}: ${errorMessage}`,
          );

          results.push({
            studentId: student.id,
            tripId,
            assigned: false,
            reason: `Assignment error: ${errorMessage}`,
          });
        }
      }

      // Summary
      const assigned = results.filter(r => r.assigned).length;
      const skipped = results.filter(r => !r.assigned).length;

      this.logger.log(
        `[StudentAssignment] Complete. ${assigned} assigned, ${skipped} skipped`,
      );

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentAssignment] Fatal error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get assignments for a trip
   */
  async getAssignmentsForTrip(tripId: string) {
    return await this.prisma.studentTripAssignment.findMany({
      where: { tripId },
      include: {
        student: true,
        boardingStop: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get assignments for a student on a specific date
   */
  async getAssignmentsForStudentAndDate(studentId: string, date: Date) {
    return await this.prisma.studentTripAssignment.findMany({
      where: {
        studentId,
        trip: {
          date: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          },
        },
      },
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
            driver: true,
          },
        },
        boardingStop: true,
      },
      orderBy: { trip: { departureTime: 'asc' } },
    });
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId: string, status: string) {
    return await this.prisma.studentTripAssignment.update({
      where: { id: assignmentId },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        student: true,
        trip: true,
        boardingStop: true,
      },
    });
  }

  /**
   * Count assignments for a trip
   */
  async countAssignmentsForTrip(tripId: string) {
    return await this.prisma.studentTripAssignment.count({
      where: { tripId },
    });
  }

  /**
   * Count assigned students on a trip (excluding no-shows and cancellations)
   */
  async countActiveAssignmentsForTrip(tripId: string) {
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
