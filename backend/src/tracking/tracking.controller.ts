import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './services/tracking.service';
import type { LocationUpdateInput } from './services/location-update.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * TrackingController handles location update endpoints
 *
 * Requires: JWT authentication + DRIVER role
 * (GPS updates are sent by drivers)
 */
@Controller('tracking')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('DRIVER')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly trackingService: TrackingService) {}

  /**
   * POST /tracking/location
   * Update bus location for a trip
   *
   * @param input Location update data
   * @returns Updated location status
   */
  @Post('location')
  @HttpCode(HttpStatus.OK)
  async updateLocation(@Body() input: LocationUpdateInput) {
    this.logger.debug(
      `[TrackingController] Location update for trip ${input.tripId}`,
    );

    try {
      const result = await this.trackingService.updateLocation(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TrackingController] Error updating location: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /tracking/activate
   * Activate a trip and start GPS tracking simulation
   */
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateTrip(@Body() body: { tripId: string }) {
    this.logger.debug(`[TrackingController] Activating trip ${body.tripId}`);

    try {
      await this.trackingService.activateTrip(body.tripId);
      return {
        success: true,
        message: `Trip ${body.tripId} activated and tracking started`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TrackingController] Error activating trip: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * POST /tracking/complete
   * Complete a trip and stop tracking
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeTrip(@Body() body: { tripId: string }) {
    this.logger.debug(`[TrackingController] Completing trip ${body.tripId}`);

    try {
      await this.trackingService.completeTrip(body.tripId);
      return {
        success: true,
        message: `Trip ${body.tripId} completed`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TrackingController] Error completing trip: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
