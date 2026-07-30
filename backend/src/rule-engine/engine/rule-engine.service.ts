import { Injectable, Logger } from '@nestjs/common';
import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult, RuleEngineDecision } from '../models/rule-result.model';

/**
 * RuleEngineService orchestrates the evaluation of multiple rules.
 * It:
 * - Maintains a registry of rules
 * - Executes rules in priority order
 * - Collects results from each rule
 * - Returns a final decision on whether the trip should be created
 *
 * The service is designed to be independent of the database.
 * Data is passed via RuleContext, allowing Prisma integration without coupling.
 */
@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);
  private rules: IRule[] = [];

  /**
   * Register a rule with the engine
   *
   * @param rule The rule to register
   */
  registerRule(rule: IRule): void {
    this.logger.debug(`Registering rule: ${rule.name} (ID: ${rule.id})`);
    this.rules.push(rule);
    // Sort rules by priority (higher priority first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register multiple rules at once
   *
   * @param rules Array of rules to register
   */
  registerRules(rules: IRule[]): void {
    rules.forEach((rule) => this.registerRule(rule));
  }

  /**
   * Get all registered rules
   *
   * @returns Array of registered rules sorted by priority
   */
  getRules(): IRule[] {
    return [...this.rules];
  }

  /**
   * Clear all registered rules
   * Useful for testing or reconfiguration
   */
  clearRules(): void {
    this.logger.debug('Clearing all registered rules');
    this.rules = [];
  }

  /**
   * Evaluate a trip against all registered rules
   *
   * @param context The rule evaluation context containing trip and resource data
   * @returns A decision object containing all rule results and final approval status
   */
  async evaluate(context: RuleContext): Promise<RuleEngineDecision> {
    const totalStartTime = performance.now();

    this.logger.log(
      `[RuleEngine] Starting evaluation for trip on ${context.date.toISOString()} ` +
        `Route: ${context.routeId}, Bus: ${context.busId}, Driver: ${context.driverId}`,
    );

    if (this.rules.length === 0) {
      this.logger.warn('[RuleEngine] No rules registered. All trips will be approved.');
    }

    const ruleResults: RuleResult[] = [];

    // Execute each rule
    for (const rule of this.rules) {
      try {
        this.logger.debug(`[RuleEngine] Executing rule: ${rule.name}`);
        const result = await rule.evaluate(context);
        // Attach criticality flag from the rule to the result
        result.isCritical = rule.isCritical;
        ruleResults.push(result);

        // Log rule result
        if (result.passed) {
          this.logger.debug(
            `[RuleEngine] ✓ ${rule.name} PASSED (${result.evaluationTimeMs}ms)`,
          );
        } else {
          const severity = rule.isCritical ? 'CRITICAL FAILURE' : 'WARNING';
          this.logger.warn(
            `[RuleEngine] ✗ ${rule.name} FAILED (${severity}) - ${result.message}`,
          );
        }

        // Early exit if critical rule fails
        if (!result.passed && rule.isCritical) {
          this.logger.warn(
            `[RuleEngine] Critical rule failed. Stopping further evaluation.`,
          );
          break;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[RuleEngine] Error executing rule ${rule.name}: ${errorMessage}`,
        );

        // Create a failed result for the error
        ruleResults.push(
          new RuleResult({
            ruleId: rule.id,
            ruleName: rule.name,
            passed: false,
            message: `Rule evaluation failed with error: ${errorMessage}`,
            isCritical: rule.isCritical,
            details: {
              error: errorMessage,
            },
            evaluationTimeMs: 0,
          }),
        );

        // If it's a critical rule, stop evaluation
        if (rule.isCritical) {
          this.logger.error(
            `[RuleEngine] Critical rule error. Stopping evaluation.`,
          );
          break;
        }
      }
    }

    const totalEvaluationTime = Math.round(performance.now() - totalStartTime);
    const decision = new RuleEngineDecision(ruleResults, totalEvaluationTime);

    // Log final decision
    this.logger.log(
      `[RuleEngine] Decision: ${decision.approved ? 'APPROVED ✓' : 'REJECTED ✗'} ` +
        `(${decision.totalEvaluationTimeMs}ms)`,
    );

    return decision;
  }

  /**
   * Evaluate a trip and return only the approval status
   * Useful when you just need a yes/no answer
   *
   * @param context The rule evaluation context
   * @returns true if approved, false if rejected
   */
  async isApproved(context: RuleContext): Promise<boolean> {
    const decision = await this.evaluate(context);
    return decision.approved;
  }

  /**
   * Get a human-readable report of the evaluation
   * Useful for logging, debugging, and administration
   *
   * @param decision The rule engine decision
   * @returns Formatted report string
   */
  getReport(decision: RuleEngineDecision): string {
    return decision.getDetailedReport();
  }
}
