import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const buses = await this.prisma.bus.findMany({
      include: {
        trips: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return buses.map((bus) => ({
      id: bus.id,
      plateNumber: bus.plateNumber,
      capacity: bus.capacity,
      status: bus.status,
      assignedDriver: bus.trips[0]?.driver?.user?.name || 'Unassigned',
    }));
  }

  async findOne(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: {
        trips: true,
      },
    });

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }

    return bus;
  }
}
