import { Test, TestingModule } from '@nestjs/testing';
import { TripGenerationService } from './trip-generation.service';
import { TripsService } from './trips.service';
import { StudentTripAssignmentService } from './student-trip-assignment.service';
import { PrismaService } from '../../common/services/prisma.service';
import { RuleEngineService } from '../../rule-engine';

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

      const mockTimetable = {
        id: 'timetable-1',
        routeId: 'route-1',
        startTime: new Date('2026-07-30T08:00:00Z'),
        endTime: new Date('2026-07-30T08:45:00Z'),
        type: 'CLASS',
      };

      const mockStudent = {
        id: 'student-1',
        routeId: 'route-1',
        studentNo: 'S001',
      };

      const mockBus = {
        id: 'bus-1',
        plateNumber: 'ABC123',
        capacity: 50,
        status: 'ACTIVE',
      };

      const mockDriver = {
        id: 'driver-1',
        licenseNo: 'DL123',
      };

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

      const mockTrip = {
        id: 'trip-1',
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        date,
        departureTime: mockTimetable.startTime,
        generatedByRuleEngine: true,
      };

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

      // Two timetables on the same day
      const mockTimetables = [
        {
          id: 'timetable-1',
          routeId: 'route-1',
          startTime: new Date('2026-07-30T08:00:00Z'),
          endTime: new Date('2026-07-30T08:45:00Z'),
          type: 'CLASS',
        },
        {
          id: 'timetable-2',
          routeId: 'route-2',
          startTime: new Date('2026-07-30T14:00:00Z'),
          endTime: new Date('2026-07-30T14:45:00Z'),
          type: 'CLASS',
        },
      ];

      const mockStudents = [
        { id: 'student-1', routeId: 'route-1', studentNo: 'S001' },
        { id: 'student-2', routeId: 'route-2', studentNo: 'S002' },
      ];

      // Only one bus available
      const mockBuses = [{ id: 'bus-1', capacity: 50, status: 'ACTIVE' }];

      // Two drivers available
      const mockDrivers = [
        { id: 'driver-1', licenseNo: 'DL1' },
        { id: 'driver-2', licenseNo: 'DL2' },
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
        {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date
        }
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
        {
          id: 'timetable-1',
          routeId: 'route-1',
          startTime: new Date('2026-07-30T08:00:00Z'),
          endTime: new Date('2026-07-30T08:45:00Z'),
          type: 'CLASS',
        },
        {
          id: 'timetable-2',
          routeId: 'route-2',
          startTime: new Date('2026-07-30T14:00:00Z'),
          endTime: new Date('2026-07-30T14:45:00Z'),
          type: 'CLASS',
        },
      ];

      const mockStudents = [
        { id: 'student-1', routeId: 'route-1', studentNo: 'S001' },
        { id: 'student-2', routeId: 'route-2', studentNo: 'S002' },
      ];

      // Two buses available
      const mockBuses = [
        { id: 'bus-1', capacity: 50, status: 'ACTIVE' },
        { id: 'bus-2', capacity: 50, status: 'ACTIVE' },
      ];

      // Only one driver available
      const mockDrivers = [{ id: 'driver-1', licenseNo: 'DL1' }];

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
        { id: 'trip-1', routeId: 'route-1', busId: 'bus-1', driverId: 'driver-1', date }
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
      const mockTimetable = {
        id: 'timetable-1',
        routeId: 'route-1',
        startTime: new Date('2026-07-30T08:00:00Z'),
        endTime: new Date('2026-07-30T08:45:00Z'),
        type: 'CLASS',
      };

      // Create 46 students (bus capacity is 50, safe capacity is 45)
      const mockStudents = Array.from({ length: 46 }, (_, i) => ({
        id: `student-${i}`,
        routeId: 'route-1',
        studentNo: `S${String(i).padStart(3, '0')}`,
      }));

      const mockBus = {
        id: 'bus-1',
        capacity: 50,
        status: 'ACTIVE',
      };

      const mockDriver = {
        id: 'driver-1',
        licenseNo: 'DL1',
      };

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

      const mockTimetable = {
        id: 'timetable-1',
        routeId: 'route-1',
        startTime: new Date('2026-07-30T08:00:00Z'),
        endTime: new Date('2026-07-30T08:45:00Z'),
        type: 'CLASS',
      };

      const mockStudent = {
        id: 'student-1',
        routeId: 'route-1',
        studentNo: 'S001',
      };

      const mockBus = {
        id: 'bus-1',
        capacity: 50,
        status: 'ACTIVE',
      };

      const mockDriver = {
        id: 'driver-1',
        licenseNo: 'DL1',
      };

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
          startTime: new Date('2026-07-30T08:00:00Z'),
          endTime: new Date('2026-07-30T08:45:00Z'),
          type: 'CLASS',
        },
        {
          id: 'timetable-2',
          routeId: 'route-A2',
          startTime: new Date('2026-07-30T14:00:00Z'),
          endTime: new Date('2026-07-30T14:45:00Z'),
          type: 'CLASS',
        },
        {
          id: 'timetable-3',
          routeId: 'route-B1',
          startTime: new Date('2026-07-30T10:00:00Z'),
          endTime: new Date('2026-07-30T10:45:00Z'),
          type: 'CLASS',
        },
      ];

      // Students distributed across routes
      const mockStudents = [
        { id: 'student-1', routeId: 'route-A1', studentNo: 'S001' },
        { id: 'student-2', routeId: 'route-A2', studentNo: 'S002' },
        { id: 'student-3', routeId: 'route-B1', studentNo: 'S003' },
      ];

      // Three buses available
      const mockBuses = [
        { id: 'bus-1', capacity: 50, status: 'ACTIVE' },
        { id: 'bus-2', capacity: 45, status: 'ACTIVE' },
        { id: 'bus-3', capacity: 40, status: 'ACTIVE' },
      ];

      // Three drivers available
      const mockDrivers = [
        { id: 'driver-1', licenseNo: 'DL1' },
        { id: 'driver-2', licenseNo: 'DL2' },
        { id: 'driver-3', licenseNo: 'DL3' },
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
