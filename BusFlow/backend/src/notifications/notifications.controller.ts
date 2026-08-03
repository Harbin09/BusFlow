import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService, CreateNotificationDto, SendNotificationDto } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    const data = await this.notificationsService.findAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    const data = await this.notificationsService.create(dto);
    return { success: true, data };
  }

  @Post('simulate-rain')
  async simulateRain() {
    const data = await this.notificationsService.triggerRainAlert();
    return { success: true, data };
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  async sendNotification(@Body() dto: SendNotificationDto) {
    const data = await this.notificationsService.sendNotification(dto);
    return { success: true, data };
  }
}

@Controller('weather')
export class WeatherController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('check')
  async checkWeather() {
    const data = await this.notificationsService.triggerRainAlert();
    return { success: true, message: 'Weather alert triggered', data };
  }
}
