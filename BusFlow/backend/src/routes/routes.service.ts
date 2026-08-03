import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const routes = await this.prisma.route.findMany({
      include: {
        stops: true,
        trips: true,
      },
    });

    return routes.map((route) => ({
      id: route.id,
      name: route.name,
      code: `RTE-${route.id}`,
      description: route.description || 'Campus Shuttle Route',
      estimatedDistance: route.estimatedDistance || 10.0,
      estimatedDuration: route.estimatedDuration || 25,
      stopsCount: route.stops.length,
      assignedBuses: route.trips.length || 1,
    }));
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: true,
        trips: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }
}
