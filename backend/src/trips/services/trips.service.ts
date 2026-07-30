import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Prisma, TripStatus } from '@prisma/client';

/**
 * TripsService handles CRUD operations for Trip records
 */
@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new trip
   */
  async createTrip(data: Prisma.TripCreateInput) {
    this.logger.debug(
      `Creating trip for route ${data.route.connect?.id} on ${data.date}`,
    );

    try {
      return await this.prisma.trip.create({
        data,
        include: {
          route: true,
          bus: true,
          driver: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create trip: ${error}`);
      throw error;
    }
  }

  /**
   * Create multiple trips in a batch
   */
  async createManyTrips(data: Prisma.TripCreateInput[]) {
    this.logger.debug(`Creating ${data.length} trips in batch`);

    try {
      const results = await Promise.all(data.map((trip) => this.createTrip(trip)));
      return results;
    } catch (error) {
      this.logger.error(`Failed to create trips in batch: ${error}`);
      throw error;
    }
  }

  /**
   * Get trip by ID
   */
  async getTrip(id: string) {
    return await this.prisma.trip.findUnique({
      where: { id },
      include: {
        route: { include: { stops: true } },
        bus: { include: { liveStatus: true } },
        driver: true,
      },
    });
  }

  /**
   * Get all trips for a given date
   */
  async getTripsForDate(date: Date) {
    return await this.prisma.trip.findMany({
      where: {
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      include: {
        route: true,
        bus: true,
        driver: true,
      },
      orderBy: [{ departureTime: 'asc' }],
    });
  }

  /**
   * Get trips for a route on a given date
   */
  async getTripsForRouteAndDate(routeId: string, date: Date) {
    return await this.prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      include: {
        bus: true,
        driver: true,
      },
      orderBy: { departureTime: 'asc' },
    });
  }

  /**
   * Update trip status
   */
  async updateTripStatus(id: string, status: TripStatus | string) {
    return await this.prisma.trip.update({
      where: { id },
      data: { status: status as TripStatus, updatedAt: new Date() },
      include: {
        route: true,
        bus: true,
        driver: true,
      },
    });
  }

  /**
   * Check if a trip already exists
   */
  async tripExists(
    routeId: string,
    busId: string,
    date: Date,
    departureTime: Date,
  ): Promise<boolean> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        busId_date_departureTime: {
          busId,
          date,
          departureTime,
        },
      },
    });

    return !!trip;
  }
}
