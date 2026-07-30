import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

export class CreateNotificationDto {
  title: string;
  message: string;
  type?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const dbNotifs = await this.prisma.notification.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    if (dbNotifs.length > 0) {
      return dbNotifs.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        status: n.status,
        createdAt: n.createdAt.toISOString(),
      }));
    }

    return [
      {
        id: 'ALT-001',
        title: 'Heavy Rain Warning',
        message: 'Precipitation expected in South Campus area. Driver advisory issued for Route 2.',
        severity: 'HIGH',
        type: 'WEATHER',
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ALT-002',
        title: 'Bus BUS-004 Maintenance Due',
        message: 'Routine engine inspection scheduled for vehicle BUS-004 tomorrow.',
        severity: 'MEDIUM',
        type: 'SYSTEM',
        status: 'READ',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'ALT-003',
        title: 'Timetable Rule Engine Sync',
        message: 'Trip schedules generated successfully for today\'s operating timetable.',
        severity: 'LOW',
        type: 'INFO',
        status: 'READ',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  async create(dto: CreateNotificationDto) {
    const adminUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      const created = await this.prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: dto.title,
          message: dto.message,
        },
      });
      return created;
    }

    return {
      id: `ALT-${Date.now()}`,
      title: dto.title,
      message: dto.message,
      createdAt: new Date().toISOString(),
    };
  }

  async triggerRainAlert() {
    return this.create({
      title: 'Rain Alert Simulation Triggered',
      message: 'Heavy rainfall warning active. Route speeds reduced by 15% across all active sectors.',
      type: 'WEATHER',
      severity: 'HIGH',
    });
  }
}
