import { Module } from '@nestjs/common';
import { TripsController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';
import { TripGenerationService } from './services/trip-generation.service';
import { StudentTripAssignmentService } from './services/student-trip-assignment.service';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';
import { PrismaModule } from '../common/prisma.module';

/**
 * TripsModule handles trip generation, student assignment, and management
 *
 * Components:
 * - TripsController: HTTP endpoints
 * - TripGenerationService: Trip orchestration
 * - StudentTripAssignmentService: Student assignment logic
 * - TripsService: Trip CRUD operations
 * - RuleEngineModule: Rule evaluation
 * - PrismaModule: Database access
 */
@Module({
  imports: [RuleEngineModule, PrismaModule],
  controllers: [TripsController],
  providers: [TripsService, TripGenerationService, StudentTripAssignmentService],
  exports: [TripsService, TripGenerationService, StudentTripAssignmentService],
})
export class TripsModule {}
