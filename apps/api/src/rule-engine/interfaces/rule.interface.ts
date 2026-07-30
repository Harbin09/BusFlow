import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';

/**
 * Core interface for all rule evaluators.
 * All rules must implement this interface for consistent behavior.
 */
export interface IRule {
  /**
   * Unique identifier for the rule
   */
  readonly id: string;

  /**
   * Human-readable name of the rule
   */
  readonly name: string;

  /**
   * Priority level (higher = evaluated first)
   * Used to order rule execution
   */
  readonly priority: number;

  /**
   * Whether this rule is critical (failure blocks trip generation)
   * If true and evaluation fails, the entire trip is rejected
   */
  readonly isCritical: boolean;

  /**
   * Evaluate the rule against the given context
   * Must not access database directly
   * Must return a structured RuleResult
   *
   * @param context The rule evaluation context
   * @returns A RuleResult indicating pass/fail with reasoning
   */
  evaluate(context: RuleContext): Promise<RuleResult> | RuleResult;
}
