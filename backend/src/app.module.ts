import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { DriversModule } from './drivers/drivers.module';
import { BusesModule } from './buses/buses.module';
import { RoutesModule } from './routes/routes.module';
import { TimetableModule } from './timetable/timetable.module';
import { TripsModule } from './trips/trips.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransportRequestsModule } from './transport-requests/transport-requests.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RuleEngineModule } from './rule-engine/rule-engine.module';
import { CommonModule } from './common/common.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),

  AuthModule,
  UsersModule,
  StudentsModule,
  DriversModule,
  BusesModule,
  RoutesModule,
  TimetableModule,
  TripsModule,
  NotificationsModule,
  TransportRequestsModule,
  AnalyticsModule,
  RuleEngineModule,
  CommonModule,
  TrackingModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
