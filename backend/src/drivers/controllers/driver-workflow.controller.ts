import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DriverWorkflowService } from '../services/driver-workflow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * DriverWorkflowController handles driver-specific API endpoints
 *
 * Requires: JWT authentication + DRIVER role
 *
 * Routes:
 * - GET /drivers/workflow/today - Get today's assigned trip
 * - POST /drivers/workflow/trips/:tripId/start - Start a trip
 * - POST /drivers/workflow/trips/:tripId/end - End a trip
 * - GET /drivers/workflow/trips/:tripId/passengers - Get passenger list
 */
@Controller('drivers/workflow')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('DRIVER')
export class DriverWorkflowController {
  private readonly logger = new Logger(DriverWorkflowController.name);

  constructor(private readonly driverWorkflow: DriverWorkflowService) {}

  /**
   * GET /drivers/workflow/today
   * Get driver's assigned trip for today
   *
   * @param user Current authenticated driver
   * @returns Today's trip or null
   */
  @Get('today')
  @HttpCode(HttpStatus.OK)
  async getTodaysTrip(@CurrentUser() user: any) {
    this.logger.debug(
      `[DriverWorkflowController] GET /drivers/workflow/today for driver ${user.id}`,
    );

    try {
      const trip = await this.driverWorkflow.getTodayTrip(user.id);

      return {
        success: true,
        data: trip,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflowController] Error getting today's trip: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /drivers/workflow/trips/:tripId/start
   * Start a trip (SCHEDULED → IN_PROGRESS)
   *
   * @param tripId Trip to start
   * @param user Current authenticated driver
   */
  @Post('trips/:tripId/start')
  @HttpCode(HttpStatus.OK)
  async startTrip(
    @Param('tripId') tripId: string,
    @Body() _body: any,
    @CurrentUser() user: any,
  ) {
    this.logger.debug(
      `[DriverWorkflowController] POST /drivers/workflow/trips/${tripId}/start for driver ${user.id}`,
    );

    try {
      await this.driverWorkflow.startTrip(user.id, tripId);

      return {
        success: true,
        message: `Trip ${tripId} started successfully`,
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

      if (error instanceof BadRequestException) {
        return {
          success: false,
          error: error.message,
          statusCode: 400,
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflowController] Error starting trip: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /drivers/workflow/trips/:tripId/end
   * End a trip (IN_PROGRESS → COMPLETED)
   *
   * @param tripId Trip to end
   * @param user Current authenticated driver
   */
  @Post('trips/:tripId/end')
  @HttpCode(HttpStatus.OK)
  async endTrip(
    @Param('tripId') tripId: string,
    @Body() _body: any,
    @CurrentUser() user: any,
  ) {
    this.logger.debug(
      `[DriverWorkflowController] POST /drivers/workflow/trips/${tripId}/end for driver ${user.id}`,
    );

    try {
      await this.driverWorkflow.endTrip(user.id, tripId);

      return {
        success: true,
        message: `Trip ${tripId} completed successfully`,
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

      if (error instanceof BadRequestException) {
        return {
          success: false,
          error: error.message,
          statusCode: 400,
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[DriverWorkflowController] Error ending trip: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /drivers/workflow/trips/:tripId/passengers
   * Get passenger list for a trip
   *
   * @param tripId Trip to get passengers for
   * @param user Current authenticated driver
   */
  @Get('trips/:tripId/passengers')
  @HttpCode(HttpStatus.OK)
  async getPassengers(
    @Param('tripId') tripId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.debug(
      `[DriverWorkflowController] GET /drivers/workflow/trips/${tripId}/passengers for driver ${user.id}`,
    );

    try {
      const passengers = await this.driverWorkflow.getPassengerList(user.id, tripId);
      const expectedCount = await this.driverWorkflow.getExpectedPassengerCount(tripId);
      const activeCount = await this.driverWorkflow.getActivePassengerCount(tripId);

      return {
        success: true,
        data: {
          passengers,
          summary: {
            total: expectedCount,
            active: activeCount,
            noshow: expectedCount - activeCount,
          },
        },
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
        `[DriverWorkflowController] Error getting passengers: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
