import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignedBusForDriver(driverId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        driverId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: {
        bus: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    if (!trip || !trip.bus) {
      throw new NotFoundException('No assigned bus found for this driver');
    }

    return trip.bus;
  }

  async updateBusLocation(busId: string, latitude: number, longitude: number, accuracy?: number) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      throw new NotFoundException('Bus not found');
    }

    const existingStatus = await this.prisma.busLiveStatus.findUnique({
      where: { busId },
    });

    if (existingStatus) {
      return await this.prisma.busLiveStatus.update({
        where: { busId },
        data: {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      });
    } else {
      return await this.prisma.busLiveStatus.create({
        data: {
          busId,
          latitude,
          longitude,
        },
      });
    }
  }

  async getPassengersOnBus(busId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { busId },
    });

    if (!trip) {
      return [];
    }

    const assignments = await this.prisma.studentTripAssignment.findMany({
      where: {
        tripId: trip.id,
        status: { in: ['BOARDED', 'SCHEDULED'] },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        boardingStop: true,
      },
    });

    return assignments.map((assignment: any) => ({
      id: assignment.student?.id || '',
      name: assignment.student?.user?.name || 'Unknown',
      email: assignment.student?.user?.email || '',
      status: assignment.status,
      pickupStop: assignment.boardingStop?.name || 'N/A',
      boardingTime: assignment.boardingTime?.toISOString() || null,
    }));
  }

  async getMissedStudents(busId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { busId },
    });

    if (!trip) {
      return [];
    }

    const missedAssignments = await this.prisma.studentTripAssignment.findMany({
      where: {
        tripId: trip.id,
        status: 'NO_SHOW',
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        boardingStop: true,
      },
    });

    return missedAssignments.map((assignment: any) => ({
      id: assignment.student?.id || '',
      studentNo: assignment.student?.id || '',
      name: assignment.student?.user?.name || 'Unknown',
      program: 'Engineering',
      semester: '4',
      pickupStop: {
        id: assignment.boardingStop?.id || '1',
        name: assignment.boardingStop?.name || 'Main Gate',
        latitude: assignment.boardingStop?.latitude || 28.5355,
        longitude: assignment.boardingStop?.longitude || 77.0522,
      },
      status: 'NO_SHOW',
    }));
  }

  async getCurrentTrip(driverId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        driverId,
        status: 'IN_PROGRESS',
      },
      include: {
        bus: true,
        route: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('No current trip found');
    }

    return trip;
  }

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
