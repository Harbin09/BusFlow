import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentsService } from '../students.service';
import { StudentWorkflowService } from '../services/student-workflow.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../common/services/prisma.service';

/**
 * StudentDashboardController provides rich API endpoints for the Student Dashboard
 *
 * Requires: JWT authentication + STUDENT role
 *
 * Routes:
 * - GET /students/profile - Get student profile with statistics
 * - GET /students/today-bus - Get today's assigned bus with live status
 * - GET /students/today-trip - Get today's trip details
 * - GET /students/pickup-point - Get boarding pickup point
 * - GET /students/return-trip - Get return/afternoon trip if exists
 * - GET /students/missed-bus - Get missed bus information
 * - GET /students/notifications - Get student's notifications
 * - POST /students/notifications/:id/read - Mark notification as read
 */
@ApiTags('Student Dashboard')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('STUDENT')
export class StudentDashboardController {
  private readonly logger = new Logger(StudentDashboardController.name);

  constructor(
    private readonly studentsService: StudentsService,
    private readonly studentWorkflow: StudentWorkflowService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /students/profile
   * Get authenticated student's profile with statistics
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get student profile with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'student-123',
          email: 'student@example.com',
          name: 'John Doe',
          studentNo: 'S001',
          program: 'Computer Science',
          semester: '2',
          credits: 1200,
          totalMissedBuses: 2,
          homeAddress: '123 Main St',
          schoolAddress: 'University Campus',
        },
      },
    },
  })
  async getProfile(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/profile for student ${user.id}`);

    try {
      // Get student details from database
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id },
        include: { user: true },
      });

      if (!student) {
        throw new NotFoundException('Student profile not found');
      }

      // Count missed buses (NO_SHOW assignments)
      const missedCount = await this.prisma.studentTripAssignment.count({
        where: {
          studentId: student.id,
          status: 'NO_SHOW',
        },
      });

      return {
        success: true,
        data: {
          id: student.id,
          email: student.user.email,
          name: student.user.name,
          studentNo: student.studentNo,
          program: student.program || 'N/A',
          semester: student.semester || 'N/A',
          credits: 1200, // Placeholder: would need a credits table
          totalMissedBuses: missedCount,
          homeAddress: '123 Main St', // Placeholder: would need a user_profile table
          schoolAddress: 'University Campus', // Placeholder
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting profile: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/today-bus
   * Get today's assigned bus with live location and status
   */
  @Get('today-bus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get today\'s assigned bus with live status' })
  @ApiResponse({
    status: 200,
    description: 'Bus information retrieved',
    schema: {
      example: {
        success: true,
        data: {
          busNumber: 'BUS-001',
          plateNumber: 'KA-001-AB-1234',
          status: 'IN_TRANSIT',
          currentLocation: { latitude: 28.5355, longitude: 77.0522 },
          capacity: 50,
          eta: 500,
          etaTime: '8:30 AM',
        },
      },
    },
  })
  async getTodayBus(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/today-bus for student ${user.id}`);

    try {
      // Get today's trip first
      const todayTrip = await this.studentWorkflow.getTodayTrip(user.id);

      if (!todayTrip) {
        return {
          success: true,
          data: null,
        };
      }

      // Get bus live status
      const busLiveStatus = await this.prisma.busLiveStatus.findUnique({
        where: { busId: todayTrip.busId },
      });

      // Get bus details
      const bus = await this.prisma.bus.findUnique({
        where: { id: todayTrip.busId },
      });

      if (!bus) {
        throw new NotFoundException('Bus not found');
      }

      // Calculate ETA (simplified: 500 seconds placeholder)
      const eta = 500;
      const etaMinutes = Math.ceil(eta / 60);
      const etaTime = new Date(Date.now() + eta * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        success: true,
        data: {
          busNumber: bus.id,
          plateNumber: bus.plateNumber,
          status: busLiveStatus?.status || 'INACTIVE',
          currentLocation: busLiveStatus
            ? { latitude: busLiveStatus.latitude, longitude: busLiveStatus.longitude }
            : null,
          capacity: bus.capacity,
          eta,
          etaTime,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting today's bus: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/today-trip
   * Get today's assigned trip details
   */
  @Get('today-trip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get today\'s trip details' })
  async getTodayTrip(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/today-trip for student ${user.id}`);

    try {
      const trip = await this.studentWorkflow.getTodayTrip(user.id);

      if (!trip) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: {
          id: trip.tripId,
          studentId: user.id,
          busId: trip.busId,
          routeId: trip.routeId,
          routeName: trip.routeName,
          tripDate: new Date().toISOString().split('T')[0],
          tripType: 'MORNING',
          status: trip.assignmentStatus,
          pickupStop: trip.pickupStop.name,
          droppingStop: 'University Campus',
          scheduledTime: trip.departureTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting today's trip: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/pickup-point
   * Get today's boarding pickup point
   */
  @Get('pickup-point')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get boarding pickup point for today' })
  async getPickupPoint(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/pickup-point for student ${user.id}`);

    try {
      const trip = await this.studentWorkflow.getTodayTrip(user.id);

      if (!trip || !trip.pickupStop) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: {
          id: trip.pickupStop.id,
          stopName: trip.pickupStop.name,
          latitude: trip.pickupStop.latitude,
          longitude: trip.pickupStop.longitude,
          stopOrder: 1,
          scheduledTime: trip.departureTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          estimatedTime: trip.departureTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting pickup point: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/return-trip
   * Get return/afternoon trip if student has one today
   */
  @Get('return-trip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get return/afternoon trip if assigned' })
  async getReturnTrip(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/return-trip for student ${user.id}`);

    try {
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get afternoon/evening trip (later in the day)
      const returnAssignment = await this.prisma.studentTripAssignment.findFirst({
        where: {
          studentId: student.id,
          trip: {
            date: {
              gte: today,
              lt: tomorrow,
            },
            departureTime: {
              gte: new Date(today.getTime() + 12 * 60 * 60 * 1000), // After 12:00 PM
            },
          },
        },
        include: {
          trip: {
            include: {
              route: true,
              bus: true,
            },
          },
        },
      });

      if (!returnAssignment) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: {
          id: returnAssignment.trip.id,
          routeName: returnAssignment.trip.route.name,
          busId: returnAssignment.trip.busId,
          scheduledTime: returnAssignment.trip.departureTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: returnAssignment.status,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting return trip: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/missed-bus
   * Get most recent missed bus (NO_SHOW assignment)
   */
  @Get('missed-bus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get most recent missed bus' })
  async getMissedBus(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/missed-bus for student ${user.id}`);

    try {
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Get most recent NO_SHOW assignment
      const missedAssignment = await this.prisma.studentTripAssignment.findFirst({
        where: {
          studentId: student.id,
          status: 'NO_SHOW',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          trip: {
            include: {
              route: true,
              bus: true,
            },
          },
        },
      });

      if (!missedAssignment) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: {
          busId: missedAssignment.trip.busId,
          busNumber: missedAssignment.trip.bus.plateNumber,
          routeId: missedAssignment.trip.routeId,
          routeName: missedAssignment.trip.route.name,
          missedAt: missedAssignment.createdAt.toISOString(),
          creditsDeducted: 50, // Placeholder value
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting missed bus: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/notifications
   * Get student's notifications
   */
  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get student\'s notifications' })
  async getNotifications(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/notifications for student ${user.id}`);

    try {
      const notifications = await this.notificationsService.findByUserId(user.id);

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting notifications: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /students/notifications/:id/read
   * Mark a notification as read
   */
  @Post('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.debug(
      `[StudentDashboard] POST /students/notifications/${notificationId}/read for student ${user.id}`,
    );

    try {
      // Verify notification belongs to this user
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (notification.userId !== user.id) {
        throw new BadRequestException('Cannot update notification for another user');
      }

      const updated = await this.notificationsService.markAsRead(notificationId);

      return {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error marking notification as read: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/available-buses
   * Get available buses for tracking (demo data with multiple buses)
   */
  @Get('available-buses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available buses for live tracking' })
  async getAvailableBuses(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/available-buses for student ${user.id}`);

    try {
      const buses = await this.prisma.bus.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      });

      const busesWithLiveData = buses.map((bus, index) => {
        const liveStatuses = [
          { latitude: 28.5355, longitude: 77.0522, status: 'IN_TRANSIT' },
          { latitude: 28.5450, longitude: 77.0600, status: 'IN_TRANSIT' },
          { latitude: 28.5250, longitude: 77.0450, status: 'IDLE' },
        ];
        const liveData = liveStatuses[index % liveStatuses.length];
        const eta = 500 + (index * 300);
        const etaTime = new Date(Date.now() + eta * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return {
          id: bus.id,
          busNumber: bus.id,
          plateNumber: bus.plateNumber,
          status: liveData.status,
          currentLocation: { latitude: liveData.latitude, longitude: liveData.longitude },
          capacity: bus.capacity,
          eta,
          etaTime,
          routeName: `Route ${index + 1}`,
          driverName: `Driver ${index + 1}`,
        };
      });

      return {
        success: true,
        data: busesWithLiveData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting available buses: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/trip-history
   * Get student's trip history (multiple trip records)
   */
  @Get('trip-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get student\'s trip history' })
  async getTripHistory(@CurrentUser() user: any) {
    this.logger.debug(`[StudentDashboard] GET /students/trip-history for student ${user.id}`);

    try {
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Get student's trip assignments
      const assignments = await this.prisma.studentTripAssignment.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Fetch corresponding trips
      const tripIds = assignments.map((a) => a.tripId);
      const trips = await this.prisma.trip.findMany({
        where: { id: { in: tripIds } },
        include: {
          route: true,
          bus: true,
        },
      });

      const tripHistory = assignments.map((assignment) => {
        const trip = trips.find((t) => t.id === assignment.tripId);
        if (!trip) return null;

        return {
          id: trip.id,
          busId: trip.busId,
          busNumber: trip.bus.id,
          routeName: trip.route.name,
          status: assignment.status,
          pickupStop: 'Pickup Point',
          droppingStop: 'University Campus',
          scheduledTime: trip.departureTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          scheduledDate: trip.date.toLocaleDateString('en-US'),
        };
      }).filter(Boolean);

      return {
        success: true,
        data: tripHistory,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error getting trip history: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /students/seed-demo-data
   * Seed demo trip data for testing (development only)
   */
  @Post('seed-demo-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed demo data for testing' })
  async seedDemoData(@CurrentUser() user: any) {
    this.logger.log(`[StudentDashboard] Seeding demo data for student ${user.id}`);

    try {
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Get or create Route
      let route = await this.prisma.route.findFirst({
        where: { name: 'Demo Route A' },
      });

      if (!route) {
        route = await this.prisma.route.create({
          data: {
            name: 'Demo Route A',
            description: 'Demo route for testing',
            estimatedDistance: 15,
            estimatedDuration: 30,
          },
        });
      }

      // Get or create Stops
      let pickupStop = await this.prisma.stop.findFirst({
        where: { name: 'Main Gate', routeId: route.id },
      });

      if (!pickupStop) {
        pickupStop = await this.prisma.stop.create({
          data: {
            name: 'Main Gate',
            latitude: 28.5355,
            longitude: 77.0522,
            routeId: route.id,
            order: 1,
          },
        });
      }

      let dropoffStop = await this.prisma.stop.findFirst({
        where: { name: 'University Campus', routeId: route.id },
      });

      if (!dropoffStop) {
        dropoffStop = await this.prisma.stop.create({
          data: {
            name: 'University Campus',
            latitude: 28.545,
            longitude: 77.06,
            routeId: route.id,
            order: 2,
          },
        });
      }

      // Get or create Bus
      let bus = await this.prisma.bus.findFirst({
        where: { plateNumber: 'DL-01-AB-0001' },
      });

      if (!bus) {
        bus = await this.prisma.bus.create({
          data: {
            plateNumber: 'DL-01-AB-0001',
            capacity: 50,
            status: 'ACTIVE',
          },
        });
      }

      // Get or create Driver
      let driver = await this.prisma.driver.findFirst({
        where: { licenseNo: 'DL-DEMO-001' },
      });

      if (!driver) {
        // Create demo driver user
        const driverUser = await this.prisma.user.create({
          data: {
            email: `driver-demo-${Date.now()}@busflow.com`,
            password: 'demo-password',
            name: 'Demo Driver',
            role: 'DRIVER',
          },
        });

        driver = await this.prisma.driver.create({
          data: {
            userId: driverUser.id,
            licenseNo: 'DL-DEMO-001',
            phone: '9999999999',
          },
        });
      }

      // Get or create Trip for today - Use UTC date to avoid timezone issues
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);

      const departureTime = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        8, 0, 0, 0 // 8:00 AM UTC
      ));

      let trip = await this.prisma.trip.findFirst({
        where: {
          busId: bus.id,
          date: {
            gte: todayUTC,
            lt: tomorrowUTC,
          },
        },
      });

      if (!trip) {
        trip = await this.prisma.trip.create({
          data: {
            routeId: route.id,
            busId: bus.id,
            driverId: driver.id,
            date: todayUTC,
            departureTime,
            status: 'SCHEDULED',
          },
        });
      }

      // Assign student to trip
      let assignment = await this.prisma.studentTripAssignment.findFirst({
        where: {
          studentId: student.id,
          tripId: trip.id,
        },
      });

      if (!assignment) {
        assignment = await this.prisma.studentTripAssignment.create({
          data: {
            studentId: student.id,
            tripId: trip.id,
            boardingStopId: pickupStop.id,
            status: 'SCHEDULED',
          },
        });
      }

      // Create Bus Live Status
      let busLiveStatus = await this.prisma.busLiveStatus.findUnique({
        where: { busId: bus.id },
      });

      if (!busLiveStatus) {
        busLiveStatus = await this.prisma.busLiveStatus.create({
          data: {
            busId: bus.id,
            latitude: 28.5355,
            longitude: 77.0522,
            status: 'IN_TRANSIT',
            currentStopId: pickupStop.id,
            nextStopId: dropoffStop.id,
            totalStudentsOnboard: 5,
          },
        });
      } else {
        // Update existing live status
        busLiveStatus = await this.prisma.busLiveStatus.update({
          where: { busId: bus.id },
          data: {
            status: 'IN_TRANSIT',
            currentStopId: pickupStop.id,
            nextStopId: dropoffStop.id,
            latitude: 28.5355,
            longitude: 77.0522,
            totalStudentsOnboard: 5,
            lastUpdated: new Date(),
          },
        });
      }

      return {
        success: true,
        data: {
          message: 'Demo data seeded successfully',
          trip: {
            id: trip.id,
            date: trip.date,
            departureTime: trip.departureTime,
            routeName: route.name,
            busNumber: bus.id,
          },
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[StudentDashboard] Error seeding demo data: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
