import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { LocationUpdateService, LocationUpdateInput } from './location-update.service';
import { GPSSimulatorService } from './gps-simulator.service';
import { TripStatus } from '@prisma/client';

/**
 * TrackingService orchestrates the tracking workflow
 *
 * Responsibilities:
 * - Route location updates to LocationUpdateService
 * - Manage GPS simulator lifecycle
 * - Handle trip status changes
 */
@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationUpdateService,
    private readonly gpsSimulator: GPSSimulatorService,
  ) {}

  /**
   * Update location for a trip
   * Entry point for both simulated and real GPS
   */
  async updateLocation(input: LocationUpdateInput) {
    this.logger.debug(`[Tracking] Location update for trip ${input.tripId}`);
    return await this.locationService.updateLocation(input);
  }

  /**
   * Start tracking a trip (with GPS simulator)
   */
  async startTracking(tripId: string): Promise<void> {
    this.logger.log(`[Tracking] Starting tracking for trip ${tripId}`);

    try {
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        this.logger.warn(`[Tracking] Trip ${tripId} not found`);
        return;
      }

      if (trip.status !== TripStatus.IN_PROGRESS) {
        this.logger.warn(
          `[Tracking] Trip ${tripId} is ${trip.status}, not IN_PROGRESS`,
        );
        return;
      }

      // Start GPS simulator for this trip
      await this.gpsSimulator.startSimulation(tripId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Tracking] Error starting tracking: ${errorMessage}`);
    }
  }

  /**
   * Stop tracking a trip
   */
  async stopTracking(tripId: string): Promise<void> {
    this.logger.log(`[Tracking] Stopping tracking for trip ${tripId}`);
    await this.gpsSimulator.stopSimulation(tripId);
  }

  /**
   * Activate a trip and start tracking
   */
  async activateTrip(tripId: string): Promise<void> {
    this.logger.log(`[Tracking] Activating trip ${tripId}`);

    try {
      // Update trip status
      await this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.IN_PROGRESS },
      });

      // Start tracking
      await this.startTracking(tripId);

      this.logger.log(`[Tracking] ✓ Trip ${tripId} activated and tracking started`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Tracking] Error activating trip: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Complete a trip and stop tracking
   */
  async completeTrip(tripId: string): Promise<void> {
    this.logger.log(`[Tracking] Completing trip ${tripId}`);

    try {
      // Stop tracking
      await this.stopTracking(tripId);

      // Update trip status
      await this.prisma.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED },
      });

      this.logger.log(`[Tracking] ✓ Trip ${tripId} completed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Tracking] Error completing trip: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get current location of a bus
   */
  async getBusLocation(busId: string) {
    return await this.locationService.getBusLocation(busId);
  }

  /**
   * Get active simulations (for debugging/monitoring)
   */
  getActiveSimulations(): string[] {
    return this.gpsSimulator.getActiveSimulations();
  }

  /**
   * Get active trips that are being tracked
   */
  async getActiveManagedTrips() {
    return await this.prisma.trip.findMany({
      where: { status: TripStatus.IN_PROGRESS },
      include: {
        bus: true,
        route: true,
      },
    });
  }
}
