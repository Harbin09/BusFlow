/**
 * Result of evaluating a single rule.
 * Provides structured feedback on whether the rule passed or failed.
 */
export class RuleResult {
  /**
   * ID of the rule that was evaluated
   */
  ruleId: string;

  /**
   * Name of the rule for human-readable output
   */
  ruleName: string;

  /**
   * Whether the rule passed (true) or failed (false)
   */
  passed: boolean;

  /**
   * Human-readable message explaining the result
   */
  message: string;

  /**
   * Whether this rule is critical
   * Critical rules: failure blocks entire trip
   * Non-critical rules: failure is just a warning
   */
  isCritical: boolean;

  /**
   * Detailed reasoning, useful for debugging and logging
   */
  details?: Record<string, unknown>;

  /**
   * Timestamp when the rule was evaluated
   */
  evaluatedAt: Date;

  /**
   * Duration in milliseconds for rule evaluation
   */
  evaluationTimeMs: number;

  constructor(partial: Partial<RuleResult>) {
    Object.assign(this, partial);
    this.evaluatedAt = new Date();
  }

  /**
   * Get a summary of the result
   */
  getSummary(): string {
    const status = this.passed ? '✓ PASS' : '✗ FAIL';
    return `${status}: ${this.ruleName} - ${this.message}`;
  }
}

/**
 * Final decision from the Rule Engine after evaluating all rules
 */
export class RuleEngineDecision {
  /**
   * Whether the trip should be created (all rules passed)
   */
  approved: boolean;

  /**
   * All rule results from the evaluation
   */
  ruleResults: RuleResult[];

  /**
   * List of critical rules that failed (if any)
   */
  criticalFailures: RuleResult[];

  /**
   * List of non-critical rules that failed (warnings)
   */
  warnings: RuleResult[];

  /**
   * Overall summary message
   */
  summary: string;

  /**
   * Total time in milliseconds for all rule evaluations
   */
  totalEvaluationTimeMs: number;

  /**
   * Timestamp of the decision
   */
  decidedAt: Date;

  constructor(
    ruleResults: RuleResult[],
    totalEvaluationTimeMs: number,
  ) {
    this.ruleResults = ruleResults;
    this.totalEvaluationTimeMs = totalEvaluationTimeMs;
    this.decidedAt = new Date();

    this.criticalFailures = ruleResults.filter(
      (r) => !r.passed && r.isCritical,
    );
    this.warnings = ruleResults.filter(
      (r) => !r.passed && !r.isCritical,
    );

    this.approved = this.criticalFailures.length === 0;

    this.summary = this.approved
      ? `Trip approved. ${ruleResults.filter((r) => r.passed).length}/${ruleResults.length} rules passed.`
      : `Trip rejected. ${this.criticalFailures.length} critical rule(s) failed.`;
  }

  /**
   * Get a detailed report of the decision
   */
  getDetailedReport(): string {
    const passed = this.ruleResults.filter((r) => r.passed);
    const failed = this.ruleResults.filter((r) => !r.passed);

    let report = `\n${'='.repeat(60)}\n`;
    report += `RULE ENGINE DECISION\n`;
    report += `${'='.repeat(60)}\n`;
    report += `Status: ${this.approved ? 'APPROVED ✓' : 'REJECTED ✗'}\n`;
    report += `Evaluation Time: ${this.totalEvaluationTimeMs}ms\n`;
    report += `\nPassed Rules (${passed.length}):\n`;
    passed.forEach((r) => {
      report += `  ${r.getSummary()}\n`;
    });

    if (failed.length > 0) {
      report += `\nFailed Rules (${failed.length}):\n`;
      failed.forEach((r) => {
        report += `  ${r.getSummary()}\n`;
      });
    }

    report += `${'='.repeat(60)}\n`;
    return report;
  }
}
