import { Module } from '@nestjs/common';
import { RuleEngineService } from './engine/rule-engine.service';
import { CapacityEvaluator } from './evaluators/capacity.evaluator';
import { DriverAvailabilityEvaluator } from './evaluators/driver-availability.evaluator';
import { TimetableEvaluator } from './evaluators/timetable.evaluator';

/**
 * RuleEngineModule provides the modular rule engine foundation for BUS FLOW.
 *
 * This module includes:
 * - RuleEngineService: Orchestrates rule evaluation
 * - Initial Evaluators: Capacity, Driver Availability, Timetable
 * - Rule Interfaces: IRule, RuleContext, RuleResult
 *
 * The architecture is designed to be:
 * - Database-agnostic (ready for Prisma integration)
 * - Modular (new rules can be added easily)
 * - Testable (all components tested independently)
 * - Extensible (new evaluators implement IRule)
 */
@Module({
  providers: [
    RuleEngineService,
    CapacityEvaluator,
    DriverAvailabilityEvaluator,
    TimetableEvaluator,
  ],
  exports: [
    RuleEngineService,
    CapacityEvaluator,
    DriverAvailabilityEvaluator,
    TimetableEvaluator,
  ],
})
export class RuleEngineModule {}
