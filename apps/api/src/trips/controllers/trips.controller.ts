import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerateTripDto } from '../dto/generate-trip.dto';
import { TripGenerationService } from '../services/trip-generation.service';

/**
 * TripsController handles HTTP endpoints for trip management
 */
@ApiTags('trips')
@Controller('trips')
export class TripsController {
  private readonly logger = new Logger(TripsController.name);

  constructor(private readonly tripGenerationService: TripGenerationService) {}

  /**
   * Generate trips for a given date
   *
   * @param dto Date to generate trips for
   * @returns Array of trip generation results
   */
  @Post('generate')
  @ApiOperation({ summary: 'Generate trips for a given date' })
  @ApiResponse({
    status: 201,
    description: 'Trips generated successfully',
    schema: {
      example: {
        date: '2026-07-30',
        results: [
          {
            routeId: 'route-1',
            busId: 'bus-1',
            driverId: 'driver-1',
            departureTime: '2026-07-30T08:00:00Z',
            approved: true,
            tripId: 'trip-123',
          },
        ],
        summary: {
          total: 1,
          approved: 1,
          rejected: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or date',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateTrips(@Body() dto: GenerateTripDto) {
    this.logger.log(
      `[TripsController] POST /trips/generate requested for date: ${dto.date}`,
    );

    try {
      // Parse date
      const date = new Date(dto.date);

      // Generate trips
      const results = await this.tripGenerationService.generateTripsForDate(date);

      // Calculate summary
      const approved = results.filter((r) => r.approved).length;
      const rejected = results.filter((r) => !r.approved).length;

      return {
        date: dto.date,
        results,
        summary: {
          total: results.length,
          approved,
          rejected,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TripsController] Error generating trips: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate trips',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
