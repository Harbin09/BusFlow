import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';

/**
 * CapacityEvaluator validates that the assigned students don't exceed bus capacity.
 * Critical rule: if the bus is at capacity, the trip cannot be created.
 */
export class CapacityEvaluator implements IRule {
  id = 'CRITICAL_CAPACITY_CHECK';
  name = 'Bus Capacity Validation';
  priority = 100;
  isCritical = true;

  /**
   * Safety factor: don't exceed this percentage of bus capacity
   * Default: 0.9 (90% - leave 10% buffer for safety)
   */
  private readonly capacitySafetyFactor: number;

  constructor(capacitySafetyFactor: number = 0.9) {
    this.capacitySafetyFactor = capacitySafetyFactor;
  }

  async evaluate(context: RuleContext): Promise<RuleResult> {
    const startTime = performance.now();

    const studentCount = context.assignedStudentIds.length;
    const safeCapacity = Math.floor(
      context.busCapacity * this.capacitySafetyFactor,
    );

    const passed = studentCount <= safeCapacity;
    const evaluationTimeMs = Math.round(performance.now() - startTime);

    return new RuleResult({
      ruleId: this.id,
      ruleName: this.name,
      passed,
      isCritical: this.isCritical,
      message: passed
        ? `Bus capacity sufficient. ${studentCount} students, capacity ${safeCapacity} (${context.busCapacity} total)`
        : `Bus capacity exceeded. ${studentCount} students assigned, safe capacity is ${safeCapacity} (${context.busCapacity} total)`,
      details: {
        assignedStudentCount: studentCount,
        busCapacity: context.busCapacity,
        safeCapacity,
        safetyFactor: this.capacitySafetyFactor,
        utilizationPercentage: Math.round(
          (studentCount / context.busCapacity) * 100,
        ),
      },
      evaluationTimeMs,
    });
  }
}
