import { DriverAvailabilityEvaluator } from './driver-availability.evaluator';
import { RuleContext } from '../models/rule-context.model';

describe('DriverAvailabilityEvaluator', () => {
  let evaluator: DriverAvailabilityEvaluator;

  beforeEach(() => {
    evaluator = new DriverAvailabilityEvaluator();
  });

  describe('evaluate', () => {
    it('should pass when driver is available', async () => {
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: ['driver-1', 'driver-2', 'driver-3'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.message).toContain('is available for assignment');
    });

    it('should fail when driver is not in available list', async () => {
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: ['driver-2', 'driver-3', 'driver-4'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not available');
    });

    it('should fail when driver ID is empty', async () => {
      const context = new RuleContext({
        driverId: '',
        availableDriverIds: ['driver-1', 'driver-2'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Invalid or missing driver ID');
    });

    it('should fail when driver ID is whitespace only', async () => {
      const context = new RuleContext({
        driverId: '   ',
        availableDriverIds: ['driver-1', 'driver-2'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Invalid or missing driver ID');
    });

    it('should include available drivers count in details', async () => {
      const availableDrivers = ['driver-1', 'driver-2', 'driver-3'];
      const context = new RuleContext({
        driverId: 'driver-5',
        availableDriverIds: availableDrivers,
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.details.totalAvailableDrivers).toBe(3);
      expect(result.details.availableDriverIds).toEqual(availableDrivers);
    });

    it('should pass when only one driver is available and matches', async () => {
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: ['driver-1'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
    });

    it('should fail when no drivers are available', async () => {
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: [],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.details.totalAvailableDrivers).toBe(0);
    });

    it('should include departure time in details', async () => {
      const departureTime = new Date('2026-07-30T08:00:00Z');
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: ['driver-1', 'driver-2'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime,
      });

      const result = await evaluator.evaluate(context);

      expect(result.details.departureTime).toBe(departureTime.toISOString());
    });

    it('should record evaluation time', async () => {
      const context = new RuleContext({
        driverId: 'driver-1',
        availableDriverIds: ['driver-1'],
        date: new Date(),
        routeId: 'route-1',
        busId: 'bus-1',
        busCapacity: 50,
        assignedStudentIds: [],
        departureTime: new Date(),
      });

      const result = await evaluator.evaluate(context);

      expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('properties', () => {
    it('should have correct ID and name', () => {
      expect(evaluator.id).toBe('CRITICAL_DRIVER_AVAILABILITY');
      expect(evaluator.name).toBe('Driver Availability Validation');
    });

    it('should have correct priority and criticality', () => {
      expect(evaluator.priority).toBe(90);
      expect(evaluator.isCritical).toBe(true);
    });
  });
});
