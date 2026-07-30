import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { StudentTripAssignmentStatus } from '@prisma/client';

export interface StudentTripInfo {
  tripId: string;
  routeId: string;
  routeName: string;
  busId: string;
  busPlateNumber: string;
  driverId: string;
  driverName: string;
  departureTime: Date;
  arrivalTime?: Date;
  pickupStop: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  assignmentStatus: StudentTripAssignmentStatus;
  boardingTime?: Date;
}

export interface BusLocationInfo {
  busId: string;
  tripId?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  timestamp: Date;
}

/**
 * StudentWorkflowService handles student-specific operations
 *
 * Responsibilities:
 * - Get student's assigned trip for today
 * - Get current bus location
 * - Enforce student authorization
 */
@Injectable()
export class StudentWorkflowService {
  private readonly logger = new Logger(StudentWorkflowService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get student's assigned trip for today
   *
   * @param studentId The student ID
   * @returns Today's trip info or null if not assigned
   * @throws ForbiddenException if trip is not for this student
   */
  async getTodayTrip(studentId: string): Promise<StudentTripInfo | null> {
    this.logger.debug(
      `[StudentWorkflow] Getting today's trip for student ${studentId}`,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get student's trip assignment for today
    const assignment = await this.prisma.studentTripAssignment.findFirst({
      where: {
        studentId,
        trip: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
      include: {
        trip: {
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
              },
            },
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
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
    });

    if (!assignment) {
      this.logger.debug(
        `[StudentWorkflow] No trip assigned for student ${studentId} today`,
      );
      return null;
    }

    this.logger.log(
      `[StudentWorkflow] ✓ Found trip ${assignment.trip.id} for student ${studentId}`,
    );

    return {
      tripId: assignment.trip.id,
      routeId: assignment.trip.route.id,
      routeName: assignment.trip.route.name,
      busId: assignment.trip.bus.id,
      busPlateNumber: assignment.trip.bus.plateNumber,
      driverId: assignment.trip.driver.id,
      driverName: assignment.trip.driver.user.name,
      departureTime: assignment.trip.departureTime,
      arrivalTime: assignment.trip.arrivalTime || undefined,
      pickupStop: assignment.boardingStop || {
        id: 'unknown',
        name: 'Not assigned',
        latitude: 0,
        longitude: 0,
      },
      assignmentStatus: assignment.status,
      boardingTime: assignment.boardingTime || undefined,
    };
  }

  /**
   * Get current location of a bus
   *
   * @param studentId Student making request
   * @param busId Bus to get location for
   * @returns Current bus location
   * @throws ForbiddenException if student's trip doesn't use this bus
   */
  async getBusLocation(
    studentId: string,
    busId: string,
  ): Promise<BusLocationInfo | null> {
    this.logger.debug(
      `[StudentWorkflow] Getting bus location for student ${studentId}, bus ${busId}`,
    );

    // Step 1: Verify student has a trip with this bus
    const studentTrip = await this.prisma.studentTripAssignment.findFirst({
      where: {
        studentId,
        trip: {
          busId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        },
      },
      include: {
        trip: {
          select: {
            busId: true,
          },
        },
      },
    });

    if (!studentTrip) {
      this.logger.warn(
        `[StudentWorkflow] Student ${studentId} attempted to access bus ${busId} they're not assigned to`,
      );
      throw new ForbiddenException('This bus is not part of your assigned trip');
    }

    // Step 2: Get bus live status
    const busStatus = await this.prisma.busLiveStatus.findUnique({
      where: { busId },
    });

    if (!busStatus) {
      this.logger.debug(`[StudentWorkflow] No location found for bus ${busId}`);
      return null;
    }

    this.logger.log(
      `[StudentWorkflow] ✓ Retrieved location for bus ${busId}`,
    );

    return {
      busId: busStatus.busId,
      tripId: busStatus.tripId || undefined,
      latitude: busStatus.latitude,
      longitude: busStatus.longitude,
      speed: busStatus.speed,
      heading: busStatus.heading || undefined,
      timestamp: busStatus.timestamp,
    };
  }

  /**
   * Verify student can access a trip
   *
   * @param studentId Student making request
   * @param tripId Trip to verify
   * @throws ForbiddenException if student not assigned to trip
   */
  async verifyStudentTrip(studentId: string, tripId: string): Promise<void> {
    const assignment = await this.prisma.studentTripAssignment.findFirst({
      where: {
        studentId,
        tripId,
      },
    });

    if (!assignment) {
      this.logger.warn(
        `[StudentWorkflow] Student ${studentId} attempted unauthorized access to trip ${tripId}`,
      );
      throw new ForbiddenException(
        'You are not assigned to this trip',
      );
    }
  }

  /**
   * Get trip assignment details for authorization
   */
  async getTripAssignment(
    studentId: string,
    tripId: string,
  ) {
    return await this.prisma.studentTripAssignment.findFirst({
      where: {
        studentId,
        tripId,
      },
      include: {
        trip: true,
      },
    });
  }
}
