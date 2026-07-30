import { CapacityEvaluator } from './capacity.evaluator';
import { RuleContext } from '../models/rule-context.model';

describe('CapacityEvaluator', () => {
  let evaluator: CapacityEvaluator;

  beforeEach(() => {
    evaluator = new CapacityEvaluator(0.9); // 90% safety factor
  });

  describe('evaluate', () => {
    it('should pass when student count is within capacity', async () => {
      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: ['student-1', 'student-2', 'student-3'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.ruleId).toBe('CRITICAL_CAPACITY_CHECK');
      expect(result.details.assignedStudentCount).toBe(3);
      expect(result.details.safeCapacity).toBe(45); // 50 * 0.9
    });

    it('should pass when student count equals safe capacity', async () => {
      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: Array.from({ length: 45 }, (_, i) => `student-${i}`),
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.details.assignedStudentCount).toBe(45);
    });

    it('should fail when student count exceeds safe capacity', async () => {
      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: Array.from({ length: 46 }, (_, i) => `student-${i}`),
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.details.assignedStudentCount).toBe(46);
      expect(result.details.safeCapacity).toBe(45);
    });

    it('should fail when student count exceeds actual bus capacity', async () => {
      const context = new RuleContext({
        busCapacity: 10,
        assignedStudentIds: Array.from({ length: 11 }, (_, i) => `student-${i}`),
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
    });

    it('should pass with empty student list', async () => {
      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: [],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.details.assignedStudentCount).toBe(0);
    });

    it('should respect custom safety factor', async () => {
      const customEvaluator = new CapacityEvaluator(0.8); // 80% factor

      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: Array.from({ length: 41 }, (_, i) => `student-${i}`),
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await customEvaluator.evaluate(context);

      expect(result.passed).toBe(false); // 41 > 40 (50 * 0.8)
      expect(result.details.safeCapacity).toBe(40);
    });

    it('should record evaluation time', async () => {
      const context = new RuleContext({
        busCapacity: 50,
        assignedStudentIds: ['student-1'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should calculate utilization percentage correctly', async () => {
      const context = new RuleContext({
        busCapacity: 100,
        assignedStudentIds: Array.from({ length: 75 }, (_, i) => `student-${i}`),
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.details.utilizationPercentage).toBe(75);
    });
  });

  describe('properties', () => {
    it('should have correct ID and name', () => {
      expect(evaluator.id).toBe('CRITICAL_CAPACITY_CHECK');
      expect(evaluator.name).toBe('Bus Capacity Validation');
    });

    it('should have correct priority and criticality', () => {
      expect(evaluator.priority).toBe(100);
      expect(evaluator.isCritical).toBe(true);
    });
  });
});
