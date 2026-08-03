import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { LocationUpdateService } from './location-update.service';
import { TripStatus } from '@prisma/client';

interface SimulationState {
  tripId: string;
  busId: string;
  stops: Array<{ latitude: number; longitude: number; order: number }>;
  currentStopIndex: number;
  nextStopIndex: number;
  currentLat: number;
  currentLon: number;
  progress: number; // 0 to 1, progress between current and next stop
  speed: number; // km/h
  timeoutHandle?: NodeJS.Timeout;
  isRunning: boolean;
}

/**
 * GPSSimulatorService simulates bus movement along a route
 *
 * Key Design:
 * - Uses existing route coordinates from the database
 * - Moves bus gradually between stops
 * - Calls LocationUpdateService (same endpoint as real GPS)
 * - Does NOT have separate simulation logic - all updates go through location update service
 * - Uses setTimeout chain instead of setInterval to prevent operation queue buildup
 * - Implements graceful shutdown to cleanup resources
 *
 * This allows seamless replacement with real GPS without code changes
 */
@Injectable()
export class GPSSimulatorService implements OnModuleDestroy {
  private readonly logger = new Logger(GPSSimulatorService.name);
  private simulations: Map<string, SimulationState> = new Map();

  // Configuration
  private readonly SIMULATOR_INTERVAL_MS = 5000; // Update every 5 seconds
  private readonly SPEED_KMH = 30; // Simulated speed
  private readonly DISTANCE_BETWEEN_POINTS_KM = 0.5; // How far bus moves per update

  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationUpdateService,
  ) {}

  /**
   * Gracefully shutdown all active simulations on module destroy
   * Prevents resource leaks and orphaned timeouts
   */
  async onModuleDestroy() {
    this.logger.log('[GPSSimulator] Shutting down simulator - stopping all active simulations');

    // Stop all running simulations
    for (const [tripId] of this.simulations) {
      await this.stopSimulation(tripId);
    }

    if (this.simulations.size > 0) {
      this.logger.warn(
        `[GPSSimulator] Force-cleared ${this.simulations.size} remaining simulations`,
      );
      this.simulations.clear();
    }

    this.logger.log('[GPSSimulator] Simulator shutdown complete');
  }

  /**
   * Start simulating GPS for a trip
   *
   * @param tripId The trip to simulate
   */
  async startSimulation(tripId: string): Promise<void> {
    this.logger.log(`[GPSSimulator] Starting simulation for trip ${tripId}`);

    try {
      // Fetch trip and route information
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          route: {
            include: {
              stops: { orderBy: { order: 'asc' } },
            },
          },
          bus: true,
        },
      });

      if (!trip) {
        this.logger.warn(`[GPSSimulator] Trip ${tripId} not found`);
        return;
      }

      if (trip.status !== TripStatus.IN_PROGRESS) {
        this.logger.warn(
          `[GPSSimulator] Trip ${tripId} is ${trip.status}, not IN_PROGRESS`,
        );
        return;
      }

      const stops = trip.route.stops;
      if (stops.length < 2) {
        this.logger.warn(`[GPSSimulator] Trip ${tripId} has less than 2 stops`);
        return;
      }

      // Initialize simulation state
      const state: SimulationState = {
        tripId,
        busId: trip.busId,
        stops: stops.map(s => ({
          latitude: s.latitude,
          longitude: s.longitude,
          order: s.order,
        })),
        currentStopIndex: 0,
        nextStopIndex: 1,
        currentLat: stops[0].latitude,
        currentLon: stops[0].longitude,
        progress: 0,
        speed: this.SPEED_KMH,
        isRunning: true,
      };

      this.simulations.set(tripId, state);

      // Send initial location
      await this.locationService.updateLocation({
        tripId,
        latitude: state.currentLat,
        longitude: state.currentLon,
        speed: 0,
      });

      // Start simulation loop using setTimeout chain instead of setInterval
      // This prevents operation queue buildup if simulateMovement takes longer than interval
      this.scheduleNextMovement(tripId);

      this.logger.log(
        `[GPSSimulator] ✓ Simulation started for trip ${tripId} with ${stops.length} stops`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[GPSSimulator] Failed to start simulation: ${errorMessage}`,
      );
    }
  }

  /**
   * Stop simulating GPS for a trip
   * Clears any pending timeout and removes simulation state
   */
  async stopSimulation(tripId: string): Promise<void> {
    const state = this.simulations.get(tripId);
    if (!state) {
      return;
    }

    // Mark as stopped to prevent scheduleNextMovement from rescheduling
    state.isRunning = false;

    // Clear pending timeout
    if (state.timeoutHandle) {
      clearTimeout(state.timeoutHandle);
      state.timeoutHandle = undefined;
    }

    this.simulations.delete(tripId);
    this.logger.log(`[GPSSimulator] ✓ Simulation stopped for trip ${tripId}`);
  }

  /**
   * Simulate one movement step (move bus between stops)
   */
  private async simulateMovement(tripId: string): Promise<void> {
    const state = this.simulations.get(tripId);
    if (!state) {
      return;
    }

    try {
      const currentStop = state.stops[state.currentStopIndex];
      const nextStop = state.stops[state.nextStopIndex];

      // Calculate progress (0 to 1)
      state.progress += this.calculateProgressIncrement();

      if (state.progress >= 1) {
        // Reached next stop, move to it
        state.currentLat = nextStop.latitude;
        state.currentLon = nextStop.longitude;
        state.progress = 0;
        state.currentStopIndex = state.nextStopIndex;
        state.nextStopIndex = Math.min(
          state.nextStopIndex + 1,
          state.stops.length - 1,
        );

        // Check if simulation should end
        if (state.currentStopIndex >= state.stops.length - 1) {
          this.logger.log(
            `[GPSSimulator] Reached final stop for trip ${tripId}`,
          );
          // Could trigger trip completion here
        }
      } else {
        // Interpolate between stops
        state.currentLat = this.lerp(
          currentStop.latitude,
          nextStop.latitude,
          state.progress,
        );
        state.currentLon = this.lerp(
          currentStop.longitude,
          nextStop.longitude,
          state.progress,
        );
      }

      // Send location update
      await this.locationService.updateLocation({
        tripId,
        latitude: state.currentLat,
        longitude: state.currentLon,
        speed: state.speed,
        heading: this.calculateHeading(currentStop, nextStop),
      });

      this.logger.debug(
        `[GPSSimulator] Updated trip ${tripId}: (${state.currentLat.toFixed(4)}, ${state.currentLon.toFixed(4)})`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[GPSSimulator] Error during movement simulation: ${errorMessage}`,
      );
    }
  }

  /**
   * Calculate how much progress to make per step
   * Based on distance and speed
   */
  private calculateProgressIncrement(): number {
    // Distance to cover per update interval
    const distancePerUpdate = (this.SPEED_KMH / 3600) * (this.SIMULATOR_INTERVAL_MS / 1000);
    // Approximate distance between stops (simplified)
    const distanceBetweenStops = this.DISTANCE_BETWEEN_POINTS_KM;
    return distancePerUpdate / distanceBetweenStops;
  }

  /**
   * Linear interpolation between two values
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Calculate heading between two points (simplified)
   */
  private calculateHeading(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): number {
    const dLon = to.longitude - from.longitude;
    const y = Math.sin(dLon) * Math.cos(to.latitude);
    const x =
      Math.cos(from.latitude) * Math.sin(to.latitude) -
      Math.sin(from.latitude) * Math.cos(to.latitude) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  }

  /**
   * Get simulation state for a trip (for debugging)
   */
  getSimulationState(tripId: string): SimulationState | undefined {
    return this.simulations.get(tripId);
  }

  /**
   * Get all active simulations
   */
  getActiveSimulations(): string[] {
    return Array.from(this.simulations.keys());
  }

  /**
   * Schedule the next movement update using setTimeout chain
   * This prevents operation queue buildup that can occur with setInterval
   *
   * Benefits:
   * - If simulateMovement takes 3 seconds but interval is 5 seconds, next call waits 5 seconds after completion
   * - Prevents runaway operation queue if database is slow
   * - Can be cancelled cleanly on stopSimulation
   */
  private scheduleNextMovement(tripId: string): void {
    const state = this.simulations.get(tripId);

    // If simulation was stopped, don't reschedule
    if (!state || !state.isRunning) {
      return;
    }

    // Schedule next movement
    state.timeoutHandle = setTimeout(async () => {
      try {
        // Only continue if still running
        if (state.isRunning) {
          await this.simulateMovement(tripId);

          // Schedule next movement after this one completes
          this.scheduleNextMovement(tripId);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[GPSSimulator] Error in scheduled movement for trip ${tripId}: ${errorMessage}`,
        );

        // Stop simulation on error to prevent infinite error loops
        await this.stopSimulation(tripId);
      }
    }, this.SIMULATOR_INTERVAL_MS);
  }
}
