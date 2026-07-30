import { Test, TestingModule } from '@nestjs/testing';
import { RuleEngineService } from './rule-engine.service';
import { IRule } from '../interfaces/rule.interface';
import { RuleContext } from '../models/rule-context.model';
import { RuleResult } from '../models/rule-result.model';
import { CapacityEvaluator } from '../evaluators/capacity.evaluator';
import { DriverAvailabilityEvaluator } from '../evaluators/driver-availability.evaluator';
import { TimetableEvaluator } from '../evaluators/timetable.evaluator';

describe('RuleEngineService', () => {
  let service: RuleEngineService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [RuleEngineService],
    }).compile();

    service = module.get<RuleEngineService>(RuleEngineService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('registerRule', () => {
    it('should register a single rule', () => {
      const rule = new CapacityEvaluator();
      service.registerRule(rule);

      const rules = service.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('CRITICAL_CAPACITY_CHECK');
    });

    it('should register multiple rules in priority order', () => {
      const capacity = new CapacityEvaluator(); // priority 100
      const driver = new DriverAvailabilityEvaluator(); // priority 90
      const timetable = new TimetableEvaluator(); // priority 110

      service.registerRule(capacity);
      service.registerRule(driver);
      service.registerRule(timetable);

      const rules = service.getRules();
      expect(rules).toHaveLength(3);
      expect(rules[0].priority).toBe(110); // Timetable first
      expect(rules[1].priority).toBe(100); // Capacity second
      expect(rules[2].priority).toBe(90); // Driver last
    });

    it('should sort rules by priority when registering', () => {
      const low = new DriverAvailabilityEvaluator(); // priority 90
      const high = new TimetableEvaluator(); // priority 110

      service.registerRule(low);
      service.registerRule(high);

      const rules = service.getRules();
      expect(rules[0].priority).toBeGreaterThanOrEqual(rules[1].priority);
    });
  });

  describe('registerRules', () => {
    it('should register multiple rules at once', () => {
      const rules = [
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
        new TimetableEvaluator(),
      ];

      service.registerRules(rules);

      const registered = service.getRules();
      expect(registered).toHaveLength(3);
    });
  });

  describe('getRules', () => {
    it('should return a copy of the rules array', () => {
      const rule = new CapacityEvaluator();
      service.registerRule(rule);

      const rules1 = service.getRules();
      const rules2 = service.getRules();

      expect(rules1).not.toBe(rules2); // Different array instances
      expect(rules1[0]).toEqual(rules2[0]); // Same content
    });

    it('should return empty array when no rules registered', () => {
      const rules = service.getRules();
      expect(rules).toEqual([]);
    });
  });

  describe('clearRules', () => {
    it('should remove all registered rules', () => {
      service.registerRules([
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
      ]);

      expect(service.getRules()).toHaveLength(2);

      service.clearRules();

      expect(service.getRules()).toHaveLength(0);
    });
  });

  describe('evaluate', () => {
    it('should evaluate all registered rules and approve when all pass', async () => {
      service.registerRules([
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
        new TimetableEvaluator(),
      ]);

      const context = new RuleContext({
        date: new Date('2026-07-30T00:00:00Z'),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date('2026-07-30T08:00:00Z'),
        assignedStudentIds: ['student-1', 'student-2'],
        availableDriverIds: ['driver-1', 'driver-2'],
        timetableType: 'CLASS',
        isHoliday: false,
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(true);
      expect(decision.ruleResults.length).toBe(3);
      expect(decision.criticalFailures).toHaveLength(0);
    });

    it('should reject when a critical rule fails', async () => {
      service.registerRules([
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
      ]);

      const context = new RuleContext({
        date: new Date('2026-07-30T00:00:00Z'),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date('2026-07-30T08:00:00Z'),
        assignedStudentIds: Array.from({ length: 51 }, (_, i) => `student-${i}`), // Exceeds capacity
        availableDriverIds: ['driver-1'],
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(false);
      expect(decision.criticalFailures.length).toBeGreaterThan(0);
    });

    it('should stop evaluation after first critical failure', async () => {
      let secondRuleCalled = false;

      const mockCriticalRule: IRule = {
        id: 'MOCK_CRITICAL',
        name: 'Mock Critical',
        priority: 100,
        isCritical: true,
        evaluate: async () => {
          return new RuleResult({
            ruleId: 'MOCK_CRITICAL',
            ruleName: 'Mock Critical',
            passed: false,
            message: 'Failed',
            evaluationTimeMs: 0,
          });
        },
      };

      const mockSecondRule: IRule = {
        id: 'MOCK_SECOND',
        name: 'Mock Second',
        priority: 50,
        isCritical: false,
        evaluate: async () => {
          secondRuleCalled = true;
          return new RuleResult({
            ruleId: 'MOCK_SECOND',
            ruleName: 'Mock Second',
            passed: true,
            message: 'Passed',
            evaluationTimeMs: 0,
          });
        },
      };

      service.registerRule(mockCriticalRule);
      service.registerRule(mockSecondRule);

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(false);
      expect(secondRuleCalled).toBe(false); // Second rule should not be called
    });

    it('should continue after non-critical rule failure', async () => {
      const mockWarningRule: IRule = {
        id: 'WARNING_RULE',
        name: 'Warning Rule',
        priority: 100,
        isCritical: false,
        evaluate: async () => {
          return new RuleResult({
            ruleId: 'WARNING_RULE',
            ruleName: 'Warning Rule',
            passed: false,
            message: 'Warning',
            evaluationTimeMs: 0,
          });
        },
      };

      const mockPassRule: IRule = {
        id: 'PASS_RULE',
        name: 'Pass Rule',
        priority: 50,
        isCritical: true,
        evaluate: async () => {
          return new RuleResult({
            ruleId: 'PASS_RULE',
            ruleName: 'Pass Rule',
            passed: true,
            message: 'Passed',
            evaluationTimeMs: 0,
          });
        },
      };

      service.registerRule(mockWarningRule);
      service.registerRule(mockPassRule);

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.ruleResults).toHaveLength(2); // Both rules evaluated
    });

    it('should handle rule evaluation errors gracefully', async () => {
      const mockErrorRule: IRule = {
        id: 'ERROR_RULE',
        name: 'Error Rule',
        priority: 100,
        isCritical: true,
        evaluate: async () => {
          throw new Error('Evaluation error');
        },
      };

      service.registerRule(mockErrorRule);

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(false);
      expect(decision.ruleResults[0].passed).toBe(false);
      expect(decision.ruleResults[0].message).toContain('error');
    });

    it('should approve when no rules are registered', async () => {
      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(true);
      expect(decision.ruleResults).toHaveLength(0);
    });

    it('should record total evaluation time', async () => {
      service.registerRule(new CapacityEvaluator());

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.totalEvaluationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should collect both critical failures and warnings', async () => {
      const warningFailing: IRule = {
        id: 'WARNING_FAIL',
        name: 'Warning Fail',
        priority: 100,
        isCritical: false,
        evaluate: async () =>
          new RuleResult({
            ruleId: 'WARNING_FAIL',
            ruleName: 'Warning Fail',
            passed: false,
            isCritical: false,
            message: 'Warning',
            evaluationTimeMs: 0,
          }),
      };

      const criticalFailing: IRule = {
        id: 'CRITICAL_FAIL',
        name: 'Critical Fail',
        priority: 50,
        isCritical: true,
        evaluate: async () =>
          new RuleResult({
            ruleId: 'CRITICAL_FAIL',
            ruleName: 'Critical Fail',
            passed: false,
            isCritical: true,
            message: 'Failed',
            evaluationTimeMs: 0,
          }),
      };

      service.registerRule(warningFailing);
      service.registerRule(criticalFailing);

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const decision = await service.evaluate(context);

      expect(decision.criticalFailures).toHaveLength(1);
      expect(decision.warnings).toHaveLength(1);
    });
  });

  describe('isApproved', () => {
    it('should return true when trip is approved', async () => {
      service.registerRule(new CapacityEvaluator());

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
      });

      const approved = await service.isApproved(context);

      expect(approved).toBe(true);
    });

    it('should return false when trip is rejected', async () => {
      service.registerRule(new TimetableEvaluator());

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: [],
        availableDriverIds: [],
        isHoliday: true, // Holiday, should fail
      });

      const approved = await service.isApproved(context);

      expect(approved).toBe(false);
    });
  });

  describe('getReport', () => {
    it('should generate a detailed report', async () => {
      service.registerRules([
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
      ]);

      const context = new RuleContext({
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        driverId: 'driver-1',
        departureTime: new Date(),
        assignedStudentIds: ['student-1'],
        availableDriverIds: ['driver-1'],
      });

      const decision = await service.evaluate(context);
      const report = service.getReport(decision);

      expect(report).toContain('RULE ENGINE DECISION');
      expect(report).toContain('APPROVED');
      expect(report).toContain('Passed Rules');
    });
  });

  describe('integration tests', () => {
    it('should handle complete trip generation workflow', async () => {
      // Setup rule engine with all evaluators
      service.registerRules([
        new TimetableEvaluator(),
        new CapacityEvaluator(),
        new DriverAvailabilityEvaluator(),
      ]);

      // Create a valid trip context
      const context = new RuleContext({
        date: new Date('2026-07-30T00:00:00Z'),
        routeId: 'route-A1',
        busId: 'bus-001',
        busCapacity: 50,
        driverId: 'driver-emp-001',
        departureTime: new Date('2026-07-30T08:00:00Z'),
        arrivalTime: new Date('2026-07-30T08:45:00Z'),
        assignedStudentIds: Array.from({ length: 30 }, (_, i) => `stu-${i}`),
        availableDriverIds: ['driver-emp-001', 'driver-emp-002'],
        estimatedDurationMinutes: 45,
        timetableType: 'CLASS',
        isHoliday: false,
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(true);
      expect(decision.ruleResults.length).toBe(3);
      expect(decision.criticalFailures).toHaveLength(0);

      // Verify the report can be generated
      const report = service.getReport(decision);
      expect(report).toBeTruthy();
    });

    it('should reject a trip with capacity and holiday violations', async () => {
      service.registerRules([
        new TimetableEvaluator(),
        new CapacityEvaluator(),
      ]);

      const context = new RuleContext({
        date: new Date('2026-10-02T00:00:00Z'), // Holiday
        routeId: 'route-A1',
        busId: 'bus-001',
        busCapacity: 50,
        driverId: 'driver-emp-001',
        departureTime: new Date('2026-10-02T08:00:00Z'),
        assignedStudentIds: Array.from({ length: 60 }, (_, i) => `stu-${i}`), // Over capacity
        availableDriverIds: ['driver-emp-001'],
        timetableType: 'HOLIDAY',
        isHoliday: true,
      });

      const decision = await service.evaluate(context);

      expect(decision.approved).toBe(false);
      expect(decision.criticalFailures.length).toBeGreaterThan(0);
    });
  });
});
