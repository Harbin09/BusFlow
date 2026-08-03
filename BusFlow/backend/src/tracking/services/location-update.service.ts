import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { TripStatus } from '@prisma/client';

export interface LocationUpdateInput {
  tripId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: Date;
}

export interface LocationUpdateResult {
  id: string;
  busId: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
  message: string;
}

/**
 * LocationUpdateService handles bus location updates
 *
 * Responsibilities:
 * - Validate trip exists and is active
 * - Update BusLiveStatus with new coordinates
 * - Broadcast location updates via WebSocket
 */
@Injectable()
export class LocationUpdateService {
  private readonly logger = new Logger(LocationUpdateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Update bus location for a trip
   *
   * @param input Location update data
   * @returns Updated location status
   * @throws BadRequestException if trip is invalid or not active
   */
  async updateLocation(input: LocationUpdateInput): Promise<LocationUpdateResult> {
    this.logger.debug(
      `[LocationUpdate] Received update for trip ${input.tripId} at (${input.latitude}, ${input.longitude})`,
    );

    try {
      // Step 1: Validate trip exists
      const trip = await this.prisma.trip.findUnique({
        where: { id: input.tripId },
        include: { bus: true },
      });

      if (!trip) {
        this.logger.warn(`[LocationUpdate] Trip ${input.tripId} not found`);
        throw new BadRequestException(`Trip ${input.tripId} not found`);
      }

      // Step 2: Ensure trip is active
      if (trip.status !== TripStatus.IN_PROGRESS) {
        this.logger.warn(
          `[LocationUpdate] Trip ${input.tripId} is ${trip.status}, not IN_PROGRESS`,
        );
        throw new BadRequestException(
          `Trip is ${trip.status}. Only IN_PROGRESS trips can be tracked.`,
        );
      }

      // Step 3: Validate coordinates
      if (!this.isValidCoordinate(input.latitude, input.longitude)) {
        this.logger.warn(
          `[LocationUpdate] Invalid coordinates: (${input.latitude}, ${input.longitude})`,
        );
        throw new BadRequestException('Invalid latitude or longitude');
      }

      // Step 4: Update or create BusLiveStatus
      const timestamp = input.timestamp || new Date();

      const liveStatus = await this.prisma.busLiveStatus.upsert({
        where: { busId: trip.busId },
        update: {
          tripId: input.tripId,
          latitude: input.latitude,
          longitude: input.longitude,
          speed: input.speed || 0,
          heading: input.heading,
          timestamp,
          lastUpdated: new Date(),
        },
        create: {
          busId: trip.busId,
          tripId: input.tripId,
          latitude: input.latitude,
          longitude: input.longitude,
          speed: input.speed || 0,
          heading: input.heading,
          timestamp,
        },
      });

      this.logger.log(
        `[LocationUpdate] ✓ Updated location for bus ${trip.busId} (trip ${input.tripId})`,
      );

      return {
        id: liveStatus.id,
        busId: liveStatus.busId,
        tripId: liveStatus.tripId || '',
        latitude: liveStatus.latitude,
        longitude: liveStatus.longitude,
        speed: liveStatus.speed,
        timestamp: liveStatus.timestamp,
        message: 'Location updated successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[LocationUpdate] Error updating location: ${errorMessage}`);
      throw new BadRequestException(`Location update failed: ${errorMessage}`);
    }
  }

  /**
   * Get current location of a bus
   */
  async getBusLocation(busId: string) {
    return await this.prisma.busLiveStatus.findUnique({
      where: { busId },
    });
  }

  /**
   * Get location history for a trip
   */
  async getTripLocationHistory(tripId: string, limit: number = 100) {
    // Note: This requires storing location history, not just current status
    // For now, we only have current status
    const liveStatus = await this.prisma.busLiveStatus.findFirst({
      where: { tripId },
    });

    return liveStatus ? [liveStatus] : [];
  }

  /**
   * Validate coordinate ranges
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}
