import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const drivers = await this.prisma.driver.findMany({
      include: {
        user: true,
        trips: {
          include: {
            bus: true,
          },
        },
      },
    });

    return drivers.map((driver) => ({
      id: driver.id,
      name: driver.user?.name || 'Unknown Driver',
      email: driver.user?.email || '',
      phone: driver.phone || '+1 555-0192',
      licenseNumber: driver.licenseNo,
      status: 'ON_DUTY',
      assignedBus: driver.trips[0]?.bus?.id || 'BUS-001',
      rating: 4.8,
    }));
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: true,
        trips: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }
}
