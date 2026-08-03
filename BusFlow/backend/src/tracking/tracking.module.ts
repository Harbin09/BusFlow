import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './services/tracking.service';
import { LocationUpdateService } from './services/location-update.service';
import { GPSSimulatorService } from './services/gps-simulator.service';
import { PrismaModule } from '../common/prisma.module';

/**
 * TrackingModule handles real-time bus location tracking
 *
 * Components:
 * - TrackingController: HTTP endpoints for location updates
 * - TrackingGateway: WebSocket for real-time updates (with JWT auth)
 * - TrackingService: Orchestration
 * - LocationUpdateService: Location update logic (source-agnostic)
 * - GPSSimulatorService: Simulates bus GPS movement
 *
 * Architecture:
 * - Location source abstracted (can be simulator or real GPS)
 * - All updates go through LocationUpdateService
 * - WebSocket broadcasts updates to subscribed clients
 * - WebSocket requires JWT authentication
 * - Trip access verified on subscribe (students/drivers only see own trips)
 */
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test-secret-key-change-in-production',
    }),
  ],
  controllers: [TrackingController],
  providers: [TrackingGateway, TrackingService, LocationUpdateService, GPSSimulatorService],
  exports: [TrackingService, LocationUpdateService, GPSSimulatorService],
})
export class TrackingModule {}
