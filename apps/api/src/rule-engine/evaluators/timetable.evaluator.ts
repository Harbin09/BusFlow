import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';

/**
 * TimetableEvaluator validates that the trip is scheduled according to the timetable.
 * This includes checking:
 * - No trips should be generated on holidays
 * - Trip departure time should align with scheduled timetable
 * - Exam days might have different scheduling rules
 * Critical rule: don't generate trips on holidays.
 */
export class TimetableEvaluator implements IRule {
  id = 'CRITICAL_TIMETABLE_CHECK';
  name = 'Timetable and Holiday Validation';
  priority = 110;
  isCritical = true;

  async evaluate(context: RuleContext): Promise<RuleResult> {
    const startTime = performance.now();

    // Rule 1: No trips on holidays
    const isHoliday = context.isHoliday || false;
    if (isHoliday) {
      const evaluationTimeMs = Math.round(performance.now() - startTime);
      return new RuleResult({
        ruleId: this.id,
        ruleName: this.name,
        passed: false,
        isCritical: this.isCritical,
        message: `No trips should be generated on holidays. Today is marked as a holiday.`,
        details: {
          date: context.date.toISOString(),
          isHoliday: true,
          timetableType: context.timetableType,
        },
        evaluationTimeMs,
      });
    }

    // Rule 2: Event days might have custom schedules (warning, not blocking)
    if (context.timetableType === 'EVENT') {
      console.warn(
        `[TimetableEvaluator] Event day detected. Trip generation may need special handling.`,
      );
    }

    // Rule 3: Exam days might have different timing
    if (context.timetableType === 'EXAM') {
      console.warn(
        `[TimetableEvaluator] Exam day detected. Consider modified schedules.`,
      );
    }

    // Rule 4: Validate departure time is reasonable
    const departureDate = context.departureTime;
    const contextDate = context.date;

    // Ensure departure time is on the same day
    const isSameDay =
      departureDate.getFullYear() === contextDate.getFullYear() &&
      departureDate.getMonth() === contextDate.getMonth() &&
      departureDate.getDate() === contextDate.getDate();

    if (!isSameDay) {
      const evaluationTimeMs = Math.round(performance.now() - startTime);
      return new RuleResult({
        ruleId: this.id,
        ruleName: this.name,
        passed: false,
        isCritical: this.isCritical,
        message: `Trip departure time must be on the same day as the trip date.`,
        details: {
          tripDate: contextDate.toISOString(),
          departureTime: departureDate.toISOString(),
        },
        evaluationTimeMs,
      });
    }

    const evaluationTimeMs = Math.round(performance.now() - startTime);

    return new RuleResult({
      ruleId: this.id,
      ruleName: this.name,
      passed: true,
      isCritical: this.isCritical,
      message: `Timetable validation passed. ${context.timetableType || 'CLASS'} day, not a holiday.`,
      details: {
        date: contextDate.toISOString(),
        timetableType: context.timetableType || 'CLASS',
        isHoliday: false,
        departureTimeValid: isSameDay,
      },
      evaluationTimeMs,
    });
  }
}
