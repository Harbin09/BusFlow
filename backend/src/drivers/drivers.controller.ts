import { Controller, Get, Post, Param, Body, UseGuards, Logger, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Public()
  @Get()
  async findAll() {
    const data = await this.driversService.findAll();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Get('assigned-bus')
  async getAssignedBus(@CurrentUser() user: any) {
    try {
      this.logger.debug(`Getting assigned bus for driver: ${user?.id}`);
      const data = await this.driversService.getAssignedBusForDriver(user?.id);
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to get assigned bus: ${error.message}`);
      return { success: false, error: { message: 'No assigned bus found' } };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Get('current-trip')
  async getCurrentTrip(@CurrentUser() user: any) {
    try {
      this.logger.debug(`Getting current trip for driver: ${user?.id}`);
      const data = await this.driversService.getCurrentTrip(user?.id);
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to get current trip: ${error.message}`);
      return { success: false, error: { message: 'No current trip found' } };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Get('notifications')
  async getNotifications(@CurrentUser() user: any, @Query('limit') limit?: string) {
    try {
      this.logger.debug(`Getting notifications for driver: ${user?.id}`);
      const notifLimit = limit ? parseInt(limit) : 20;
      const data = await this.notificationsService.findByUserId(user?.id);
      return { success: true, data: data.slice(0, notifLimit) };
    } catch (error: any) {
      this.logger.error(`Failed to fetch notifications: ${error.message}`);
      return { success: true, data: [] };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Post('bus/:busId/location')
  async updateLocation(
    @Param('busId') busId: string,
    @Body() body: { latitude: number; longitude: number; accuracy?: number },
    @CurrentUser() user: any
  ) {
    try {
      this.logger.debug(`Updating bus location for driver: ${user?.id}`);
      const data = await this.driversService.updateBusLocation(
        busId,
        body.latitude,
        body.longitude,
        body.accuracy
      );
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to update location: ${error.message}`);
      return { success: false, error: { message: 'Failed to update location' } };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Get('bus/:busId/passengers')
  async getPassengers(@Param('busId') busId: string, @CurrentUser() user: any) {
    try {
      this.logger.debug(`Getting passengers for bus: ${busId}`);
      const data = await this.driversService.getPassengersOnBus(busId);
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to fetch passengers: ${error.message}`);
      return { success: false, error: { message: 'Failed to fetch passengers' } };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Get('bus/:busId/missed-students')
  async getMissedStudents(@Param('busId') busId: string, @CurrentUser() user: any) {
    try {
      this.logger.debug(`Getting missed students for bus: ${busId}`);
      const data = await this.driversService.getMissedStudents(busId);
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to fetch missed students: ${error.message}`);
      return { success: false, error: { message: 'Failed to fetch missed students' } };
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  @Post('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: any
  ) {
    try {
      this.logger.debug(`Marking notification as read: ${notificationId}`);
      const data = await this.notificationsService.markAsRead(notificationId);
      return { success: true, data };
    } catch (error: any) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      return { success: false, error: { message: 'Failed to mark notification as read' } };
    }
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.driversService.findOne(id);
    return { success: true, data };
  }
}
