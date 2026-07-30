import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';

/**
 * DriverAvailabilityEvaluator validates that the assigned driver is available
 * and not already assigned to another trip at the same time.
 * Critical rule: if the driver is not available, the trip cannot be created.
 */
export class DriverAvailabilityEvaluator implements IRule {
  id = 'CRITICAL_DRIVER_AVAILABILITY';
  name = 'Driver Availability Validation';
  priority = 90;
  isCritical = true;

  async evaluate(context: RuleContext): Promise<RuleResult> {
    const startTime = performance.now();

    // Check if driver is in the available drivers list
    const driverIsAvailable = context.availableDriverIds.includes(
      context.driverId,
    );

    // Additional validation: driver must exist in context
    const driverIdIsValid = !!(context.driverId && context.driverId.trim().length > 0);

    const passed = driverIsAvailable && driverIdIsValid;
    const evaluationTimeMs = Math.round(performance.now() - startTime);

    return new RuleResult({
      ruleId: this.id,
      ruleName: this.name,
      passed,
      isCritical: this.isCritical,
      message: passed
        ? `Driver ${context.driverId} is available for assignment`
        : this.getFailureMessage(driverIdIsValid, driverIsAvailable, context),
      details: {
        requestedDriverId: context.driverId,
        driverIsValid: driverIdIsValid,
        driverIsAvailable,
        totalAvailableDrivers: context.availableDriverIds.length,
        availableDriverIds: context.availableDriverIds,
        departureTime: context.departureTime.toISOString(),
      },
      evaluationTimeMs,
    });
  }

  private getFailureMessage(
    driverIdIsValid: boolean,
    driverIsAvailable: boolean,
    context: RuleContext,
  ): string {
    if (!driverIdIsValid) {
      return 'Invalid or missing driver ID';
    }
    if (!driverIsAvailable) {
      return `Driver ${context.driverId} is not available for this time slot. ${context.availableDriverIds.length} driver(s) available.`;
    }
    return 'Driver availability check failed';
  }
}
