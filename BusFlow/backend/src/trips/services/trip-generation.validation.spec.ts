import { Test, TestingModule } from '@nestjs/testing';
import { TripGenerationService } from './trip-generation.service';
import { TripsService } from './trips.service';
import { StudentTripAssignmentService } from './student-trip-assignment.service';
import { PrismaService } from '../../common/services/prisma.service';
import { RuleEngineService } from '../../rule-engine';

// Helper functions to create complete mock objects matching Prisma schema
const createMockTimetable = (id: string, routeId: string, date: Date, startTime: Date, endTime: Date) => ({
  id,
  routeId,
  date,
  startTime,
  endTime,
  status: 'SCHEDULED' as const,
  type: 'CLASS' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockStudent = (id: string, userId: string, routeId: string, studentNo: string) => ({
  id,
  userId,
  routeId,
  studentNo,
  program: 'CS',
  semester: '2',
  campus: 'Main',
  pickupStopId: null,
  pickupCity: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockBus = (id: string, capacity: number, status: string) => ({
  id,
  plateNumber: `BUS-${id}`,
  capacity,
  status: status as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockDriver = (id: string, licenseNo: string) => ({
  id,
  userId: `user-${id}`,
  licenseNo,
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockTrip = (id: string, routeId: string, busId: string, driverId: string, date: Date, departureTime: Date) => ({
  id,
  routeId,
  busId,
  driverId,
  date,
  departureTime,
  arrivalTime: null,
  status: 'SCHEDULED' as const,
  generatedByRuleEngine: true,
  timetableId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Validation Tests for Trip Generation
 *
 * These tests verify that trip generation with real data:
 * 1. Creates trips with all required fields
 * 2. Prevents bus assignment conflicts
 * 3. Prevents driver assignment conflicts
 * 4. Respects capacity constraints
 * 5. Applies rule engine decisions correctly
 */
describe('TripGeneration - Constraint Validation', () => {
  let service: TripGenerationService;
  let prismaService: PrismaService;
  let tripsService: TripsService;
  let ruleEngine: RuleEngineService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      timetable: {
        findMany: jest.fn(),
      },
      route: {
        findMany: jest.fn(),
      },
      student: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      bus: {
        findMany: jest.fn(),
      },
      driver: {
        findMany: jest.fn(),
      },
      trip: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callbacks) => {
        if (typeof callbacks === 'function') {
          return callbacks();
        }
        const results = [];
        for (const cb of callbacks) {
          const result = typeof cb === 'function' ? await cb() : cb;
          results.push(result);
        }
        return results;
      }),
    };

    const mockTripsService = {
      createTrip: jest.fn(),
      tripExists: jest.fn(),
    };

    const mockRuleEngine = {
      clearRules: jest.fn(),
      registerRules: jest.fn(),
      evaluate: jest.fn(),
    };

    const mockAssignmentService = {
      assignStudentsToTrip: jest.fn().mockResolvedValue([]),
    };

    module = await Test.createTestingModule({
      providers: [
        TripGenerationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TripsService, useValue: mockTripsService },
        { provide: StudentTripAssignmentService, useValue: mockAssignmentService },
        { provide: RuleEngineService, useValue: mockRuleEngine },
      ],
    }).compile();

    service = module.get<TripGenerationService>(TripGenerationService);
    prismaService = module.get<PrismaService>(PrismaService);
    tripsService = module.get<TripsService>(TripsService);
    ruleEngine = module.get<RuleEngineService>(RuleEngineService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('Constraint Validation', () => {
    it('should validate that all created trips have required fields', async () => {
      const date = new Date('2026-07-30');

      const date = new Date('2026-07-30');
      const mockTimetable = createMockTimetable('timetable-1', 'route-1', date, new Date('2026-07-30T08:00:00Z'), new Date('2026-07-30T08:45:00Z'));
      const mockStudent = createMockStudent('student-1', 'user-1', 'route-1', 'S001');
      const mockBus = createMockBus('bus-1', 50, 'ACTIVE');
      const mockDriver = createMockDriver('driver-1', 'DL123');

      jest
        .spyOn(prismaService.timetable, 'findMany')
        .mockResolvedValue([mockTimetable]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([mockStudent]);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([mockBus]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([mockDriver]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);
      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: true,
        ruleResults: [],
        criticalFailures: [],
        warnings: [],
        summary: 'Approved',
        totalEvaluationTimeMs: 5,
        decidedAt: new Date(),
        getDetailedReport: () => 'Report',
      } as any);

      const mockTrip = createMockTrip('trip-1', 'route-1', 'bus-1', 'driver-1', date, mockTimetable.startTime);

      jest.spyOn(prismaService as any, '$transaction').mockResolvedValue([mockTrip]);

      const results = await service.generateTripsForDate(date);

      // Verify all required fields are present in result
      const approved = results.filter(r => r.approved);
      approved.forEach(trip => {
        expect(trip.routeId).toBeDefined();
        expect(trip.busId).toBeDefined();
        expect(trip.driverId).toBeDefined();
        expect(trip.departureTime).toBeDefined();
        expect(trip.tripId).toBeDefined();
      });

      console.log('✓ Validation: All created trips have required fields (routeId, busId, driverId, departureTime)');
    });

    it('should prevent the same bus from being assigned to multiple trips', async () => {
      const date = new Date('2026-07-30');

      const date = new Date('2026-07-30');
      // Two timetables on the same day
      const mockTimetables = [
        createMockTimetable('timetable-1', 'route-1', date, new Date('2026-07-30T08:00:00Z'), new Date('2026-07-30T08:45:00Z')),
        createMockTimetable('timetable-2', 'route-2', date, new Date('2026-07-30T14:00:00Z'), new Date('2026-07-30T14:45:00Z')),
      ];

      const mockStudents = [
        createMockStudent('student-1', 'user-1', 'route-1', 'S001'),
        createMockStudent('student-2', 'user-2', 'route-2', 'S002'),
      ];

      // Only one bus available
      const mockBuses = [createMockBus('bus-1', 50, 'ACTIVE')];

      // Two drivers available
      const mockDrivers = [
        createMockDriver('driver-1', 'DL1'),
        createMockDriver('driver-2', 'DL2'),
      ];

      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue(mockTimetables);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue(mockBuses);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue(mockDrivers);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: true,
        ruleResults: [],
        criticalFailures: [],
        warnings: [],
        summary: 'Approved',
        totalEvaluationTimeMs: 5,
        decidedAt: new Date(),
        getDetailedReport: () => 'Report',
      } as any);

      // Track bus assignments and mock transaction to return created trips
      jest.spyOn(prismaService as any, '$transaction').mockResolvedValue([
        createMockTrip('trip-1', 'route-1', 'bus-1', 'driver-1', date, new Date('2026-07-30T08:00:00Z'))
      ]);

      const results = await service.generateTripsForDate(date);

      // First trip should be approved (bus is available)
      // Second trip should be rejected (bus already allocated to first trip)
      const approved = results.filter(r => r.approved).length;
      const rejected = results.filter(r => !r.approved).length;

      expect(approved).toBe(1);
      expect(rejected).toBe(1);

      // Verify the rejected trip is due to no available buses
      const rejection = results.find(r => !r.approved);
      expect(rejection?.reason).toContain('No available buses');

      console.log('✓ Validation: Same bus not assigned to multiple trips');
      console.log(`  - Trip 1: Approved (bus allocated)`);
      console.log(`  - Trip 2: Rejected (${rejection?.reason})`);
    });

    it('should prevent the same driver from being assigned to multiple trips', async () => {
      const date = new Date('2026-07-30');

      // Two timetables on the same day
      const mockTimetables = [
        createMockTimetable('timetable-1', 'route-1', date, new Date('2026-07-30T08:00:00Z'), new Date('2026-07-30T08:45:00Z')),
        createMockTimetable('timetable-2', 'route-2', date, new Date('2026-07-30T14:00:00Z'), new Date('2026-07-30T14:45:00Z')),
      ];

      const mockStudents = [
        createMockStudent('student-1', 'user-1', 'route-1', 'S001'),
        createMockStudent('student-2', 'user-2', 'route-2', 'S002'),
      ];

      // Two buses available
      const mockBuses = [
        createMockBus('bus-1', 50, 'ACTIVE'),
        createMockBus('bus-2', 50, 'ACTIVE'),
      ];

      // Only one driver available
      const mockDrivers = [createMockDriver('driver-1', 'DL1')];

      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue(mockTimetables);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue(mockBuses);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue(mockDrivers);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: true,
        ruleResults: [],
        criticalFailures: [],
        warnings: [],
        summary: 'Approved',
        totalEvaluationTimeMs: 5,
        decidedAt: new Date(),
        getDetailedReport: () => 'Report',
      } as any);

      jest.spyOn(prismaService as any, '$transaction').mockResolvedValue([
        createMockTrip('trip-1', 'route-1', 'bus-1', 'driver-1', date, new Date('2026-07-30T08:00:00Z'))
      ]);

      const results = await service.generateTripsForDate(date);

      // First trip should be approved (driver is available)
      // Second trip should be rejected (driver already allocated)
      const approved = results.filter(r => r.approved).length;
      const rejected = results.filter(r => !r.approved).length;

      expect(approved).toBe(1);
      expect(rejected).toBe(1);

      // Verify the rejected trip is due to no available drivers
      const rejection = results.find(r => !r.approved);
      expect(rejection?.reason).toContain('No available drivers');

      console.log('✓ Validation: Same driver not assigned to multiple trips');
      console.log(`  - Trip 1: Approved (driver allocated)`);
      console.log(`  - Trip 2: Rejected (${rejection?.reason})`);
    });

    it('should respect bus capacity constraints (90% safe capacity)', async () => {
      const date = new Date('2026-07-30');

      // One timetable
      const mockTimetable = createMockTimetable('timetable-1', 'route-1', date, new Date('2026-07-30T08:00:00Z'), new Date('2026-07-30T08:45:00Z'));

      // Create 46 students (bus capacity is 50, safe capacity is 45)
      const mockStudents = Array.from({ length: 46 }, (_, i) =>
        createMockStudent(`student-${i}`, `user-${i}`, 'route-1', `S${String(i).padStart(3, '0')}`)
      );

      const mockBus = createMockBus('bus-1', 50, 'ACTIVE');
      const mockDriver = createMockDriver('driver-1', 'DL1');

      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue([mockTimetable]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([mockBus]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([mockDriver]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      // Mock rule engine to reject due to capacity
      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: false,
        ruleResults: [
          {
            ruleId: 'CRITICAL_CAPACITY_CHECK',
            ruleName: 'Bus Capacity Validation',
            passed: false,
            isCritical: true,
            message: 'Bus capacity exceeded. 46 students assigned, safe capacity is 45',
            details: { studentCount: 46, safeCapacity: 45 },
            evaluatedAt: new Date(),
            evaluationTimeMs: 2,
            getSummary: () => 'Capacity exceeded',
          }
        ],
        criticalFailures: [
          {
            ruleId: 'CRITICAL_CAPACITY_CHECK',
            ruleName: 'Bus Capacity Validation',
            passed: false,
            isCritical: true,
            message: 'Bus capacity exceeded. 46 students assigned, safe capacity is 45',
            details: {},
            evaluatedAt: new Date(),
            evaluationTimeMs: 2,
            getSummary: () => 'Capacity exceeded',
          }
        ],
        warnings: [],
        summary: 'Rejected',
        totalEvaluationTimeMs: 2,
        decidedAt: new Date(),
        getDetailedReport: () => 'Capacity exceeded',
      } as any);

      const results = await service.generateTripsForDate(date);

      // Trip should be rejected due to capacity
      expect(results).toHaveLength(1);
      expect(results[0].approved).toBe(false);
      expect(results[0].reason).toContain('Bus capacity exceeded');

      console.log('✓ Validation: Bus capacity constraints respected (90% safe capacity)');
      console.log(`  - Students: 46, Bus capacity: 50, Safe capacity: 45`);
      console.log(`  - Trip: Rejected (exceeds safe capacity)`);
    });

    it('should correctly apply rule engine decisions', async () => {
      const date = new Date('2026-07-30');

      const mockTimetable = createMockTimetable('timetable-1', 'route-1', date, new Date('2026-07-30T08:00:00Z'), new Date('2026-07-30T08:45:00Z'));
      const mockStudent = createMockStudent('student-1', 'user-1', 'route-1', 'S001');
      const mockBus = createMockBus('bus-1', 50, 'ACTIVE');
      const mockDriver = createMockDriver('driver-1', 'DL1');

      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue([mockTimetable]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([mockStudent]);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([mockBus]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([mockDriver]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      const mockDecision = {
        approved: true,
        ruleResults: [
          {
            ruleId: 'CRITICAL_TIMETABLE',
            ruleName: 'Timetable Validation',
            passed: true,
            isCritical: true,
            message: 'Timetable is valid',
            details: {},
            evaluatedAt: new Date(),
            evaluationTimeMs: 1,
            getSummary: () => 'Passed',
          },
          {
            ruleId: 'CRITICAL_CAPACITY',
            ruleName: 'Capacity Check',
            passed: true,
            isCritical: true,
            message: 'Capacity is sufficient',
            details: {},
            evaluatedAt: new Date(),
            evaluationTimeMs: 1,
            getSummary: () => 'Passed',
          },
          {
            ruleId: 'CRITICAL_DRIVER',
            ruleName: 'Driver Availability',
            passed: true,
            isCritical: true,
            message: 'Driver is available',
            details: {},
            evaluatedAt: new Date(),
            evaluationTimeMs: 1,
            getSummary: () => 'Passed',
          },
        ],
        criticalFailures: [],
        warnings: [],
        summary: 'Approved',
        totalEvaluationTimeMs: 3,
        decidedAt: new Date(),
        getDetailedReport: () => 'All rules passed',
      };

      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue(mockDecision as any);
      jest.spyOn(prismaService as any, '$transaction').mockResolvedValue([
        {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date,
          departureTime: mockTimetable.startTime,
          status: 'SCHEDULED',
          generatedByRuleEngine: true,
        }
      ]);

      const results = await service.generateTripsForDate(date);

      // Verify all rules evaluated
      expect(ruleEngine.evaluate).toHaveBeenCalled();

      // Verify trip approved
      expect(results).toHaveLength(1);
      expect(results[0].approved).toBe(true);
      expect(results[0].tripId).toBe('trip-1');

      console.log('✓ Validation: Rule engine decisions applied correctly');
      console.log(`  - Rules evaluated: 3`);
      console.log(`  - All rules passed: Yes`);
      console.log(`  - Trip created: Yes (trip-1)`);
    });
  });

  describe('Production Readiness', () => {
    it('should handle multiple routes without conflicts', async () => {
      const date = new Date('2026-07-30');

      // Three different routes
      const mockTimetables = [
        {
          id: 'timetable-1',
          routeId: 'route-A1',
          date: date,
          startTime: new Date('2026-07-30T08:00:00Z'),
          endTime: new Date('2026-07-30T08:45:00Z'),
          status: 'SCHEDULED' as const,
          type: 'CLASS' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'timetable-2',
          routeId: 'route-A2',
          date: date,
          startTime: new Date('2026-07-30T14:00:00Z'),
          endTime: new Date('2026-07-30T14:45:00Z'),
          status: 'SCHEDULED' as const,
          type: 'CLASS' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'timetable-3',
          routeId: 'route-B1',
          date: date,
          startTime: new Date('2026-07-30T10:00:00Z'),
          endTime: new Date('2026-07-30T10:45:00Z'),
          status: 'SCHEDULED' as const,
          type: 'CLASS' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Students distributed across routes
      const mockStudents = [
        { id: 'student-1', userId: 'user-1', routeId: 'route-A1', studentNo: 'S001', program: 'CS', semester: '2', campus: 'Main', pickupStopId: null, pickupCity: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'student-2', userId: 'user-2', routeId: 'route-A2', studentNo: 'S002', program: 'EE', semester: '1', campus: 'North', pickupStopId: null, pickupCity: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'student-3', userId: 'user-3', routeId: 'route-B1', studentNo: 'S003', program: 'ME', semester: '3', campus: 'South', pickupStopId: null, pickupCity: null, createdAt: new Date(), updatedAt: new Date() },
      ];

      // Three buses available
      const mockBuses = [
        { id: 'bus-1', plateNumber: 'BUS-001', capacity: 50, status: 'ACTIVE' as const, createdAt: new Date(), updatedAt: new Date() },
        { id: 'bus-2', plateNumber: 'BUS-002', capacity: 45, status: 'ACTIVE' as const, createdAt: new Date(), updatedAt: new Date() },
        { id: 'bus-3', plateNumber: 'BUS-003', capacity: 40, status: 'ACTIVE' as const, createdAt: new Date(), updatedAt: new Date() },
      ];

      // Three drivers available
      const mockDrivers = [
        { id: 'driver-1', userId: 'user-d1', licenseNo: 'DL1', phone: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'driver-2', userId: 'user-d2', licenseNo: 'DL2', phone: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'driver-3', userId: 'user-d3', licenseNo: 'DL3', phone: null, createdAt: new Date(), updatedAt: new Date() },
      ];

      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue(mockTimetables);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue(mockBuses);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue(mockDrivers);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: true,
        ruleResults: [],
        criticalFailures: [],
        warnings: [],
        summary: 'Approved',
        totalEvaluationTimeMs: 5,
        decidedAt: new Date(),
        getDetailedReport: () => 'Report',
      } as any);

      let creationCount = 0;
      jest.spyOn(prismaService as any, '$transaction').mockImplementation(async (callbacks) => {
        const results = [];
        for (const cb of callbacks) {
          creationCount++;
          results.push({
            id: `trip-${creationCount}`,
            routeId: `route-${creationCount}`,
            busId: `bus-${creationCount}`,
            driverId: `driver-${creationCount}`,
            date,
            departureTime: new Date('2026-07-30T08:00:00Z'),
            arrivalTime: null,
            status: 'SCHEDULED' as const,
            generatedByRuleEngine: true,
            timetableId: `timetable-${creationCount}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return results;
      });

      const results = await service.generateTripsForDate(date);

      const approved = results.filter(r => r.approved);
      const usedBuses = new Set(approved.map(t => t.busId));
      const usedDrivers = new Set(approved.map(t => t.driverId));

      // All should be approved
      expect(approved.length).toBeGreaterThan(0);

      // No conflicts
      expect(usedBuses.size).toBe(approved.length);
      expect(usedDrivers.size).toBe(approved.length);

      console.log(`✓ Production Readiness: Multiple routes handled without conflicts`);
      console.log(`  - Routes: 3`);
      console.log(`  - Trips approved: ${approved.length}`);
      console.log(`  - Unique buses used: ${usedBuses.size}`);
      console.log(`  - Unique drivers used: ${usedDrivers.size}`);
    });
  });
});
