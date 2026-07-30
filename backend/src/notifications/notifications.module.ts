import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { NotificationsController, WeatherController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController, WeatherController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
