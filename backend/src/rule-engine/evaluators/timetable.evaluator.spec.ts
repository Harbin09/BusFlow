import { TimetableEvaluator } from './timetable.evaluator';
import { RuleContext } from '../models/rule-context.model';

describe('TimetableEvaluator', () => {
  let evaluator: TimetableEvaluator;

  beforeEach(() => {
    evaluator = new TimetableEvaluator();
  });

  describe('evaluate', () => {
    it('should pass on a regular class day', async () => {
      const date = new Date('2026-07-30T00:00:00Z'); // Thursday
      const departureTime = new Date('2026-07-30T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Timetable validation passed');
    });

    it('should fail on a holiday', async () => {
      const date = new Date('2026-10-02T00:00:00Z'); // Gandhi Jayanti (example)
      const departureTime = new Date('2026-10-02T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'HOLIDAY',
        isHoliday: true,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('No trips should be generated on holidays');
    });

    it('should fail when departure time is on different day', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-31T08:00:00Z'); // Next day!

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('departure time must be on the same day');
    });

    it('should pass when departure time is same day but different time', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T14:30:00Z'); // Afternoon

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
    });

    it('should pass on exam day with warning', async () => {
      const date = new Date('2026-08-15T00:00:00Z');
      const departureTime = new Date('2026-08-15T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'EXAM',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.details.timetableType).toBe('EXAM');
    });

    it('should pass on event day with warning', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T10:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'EVENT',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.details.timetableType).toBe('EVENT');
    });

    it('should default to CLASS if timetableType is not provided', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.message).toContain('CLASS');
    });

    it('should handle isHoliday being undefined', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
        // isHoliday not provided
      });

      const result = await evaluator.evaluate(context);

      expect(result.passed).toBe(true);
      expect(result.details.isHoliday).toBe(false);
    });

    it('should include date information in details', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.details.date).toBe(date.toISOString());
    });

    it('should record evaluation time', async () => {
      const date = new Date('2026-07-30T00:00:00Z');
      const departureTime = new Date('2026-07-30T08:00:00Z');

      const context = new RuleContext({
        date,
        departureTime,
        timetableType: 'CLASS',
        isHoliday: false,
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        busCapacity: 50,
        assignedStudentIds: [],
      });

      const result = await evaluator.evaluate(context);

      expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('properties', () => {
    it('should have correct ID and name', () => {
      expect(evaluator.id).toBe('CRITICAL_TIMETABLE_CHECK');
      expect(evaluator.name).toBe('Timetable and Holiday Validation');
    });

    it('should have correct priority and criticality', () => {
      expect(evaluator.priority).toBe(110);
      expect(evaluator.isCritical).toBe(true);
    });
  });
});
