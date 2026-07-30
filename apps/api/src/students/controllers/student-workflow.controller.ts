import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { StudentWorkflowService } from '../services/student-workflow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * StudentWorkflowController handles student-specific API endpoints
 *
 * Requires: JWT authentication + STUDENT role
 *
 * Routes:
 * - GET /students/workflow/today - Get today's assigned trip
 * - GET /students/workflow/bus-location/:tripId - Get bus location
 */
@Controller('students/workflow')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('STUDENT')
export class StudentWorkflowController {
  private readonly logger = new Logger(StudentWorkflowController.name);

  constructor(private readonly studentWorkflow: StudentWorkflowService) {}

  /**
   * GET /students/workflow/today
   * Get student's assigned trip for today
   *
   * @param user Current authenticated student
   * @returns Today's trip with bus info or null
   */
  @Get('today')
  @HttpCode(HttpStatus.OK)
  async getTodaysTrip(@CurrentUser() user: any) {
    this.logger.debug(
      `[StudentWorkflowController] GET /students/workflow/today for student ${user.id}`,
    );

    try {
      const trip = await this.studentWorkflow.getTodayTrip(user.id);

      return {
        success: true,
        data: trip,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[StudentWorkflowController] Error getting today's trip: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /students/workflow/bus-location/:tripId
   * Get current location of bus for assigned trip
   *
   * @param tripId Trip ID to get bus location for
   * @param user Current authenticated student
   * @returns Current bus location with coordinates
   */
  @Get('bus-location/:tripId')
  @HttpCode(HttpStatus.OK)
  async getBusLocation(
    @Param('tripId') tripId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.debug(
      `[StudentWorkflowController] GET /students/workflow/bus-location/${tripId} for student ${user.id}`,
    );

    try {
      // Verify student is assigned to this trip
      await this.studentWorkflow.verifyStudentTrip(user.id, tripId);

      // Get the trip assignment to get busId
      const assignment = await this.studentWorkflow.getTripAssignment(
        user.id,
        tripId,
      );

      if (!assignment || !assignment.trip) {
        throw new NotFoundException('Trip not found for this student');
      }

      const busLocation = await this.studentWorkflow.getBusLocation(
        user.id,
        assignment.trip.busId,
      );

      return {
        success: true,
        data: busLocation,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return {
          success: false,
          error: error.message,
          statusCode: 403,
        };
      }

      if (error instanceof NotFoundException) {
        return {
          success: false,
          error: error.message,
          statusCode: 404,
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[StudentWorkflowController] Error getting bus location: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
