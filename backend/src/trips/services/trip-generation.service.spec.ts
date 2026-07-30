import { Test, TestingModule } from '@nestjs/testing';
import { TripGenerationService } from './trip-generation.service';
import { TripsService } from './trips.service';
import { StudentTripAssignmentService } from './student-trip-assignment.service';
import { PrismaService } from '../../common/services/prisma.service';
import { RuleEngineService } from '../../rule-engine';

describe('TripGenerationService', () => {
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
      },
      $transaction: jest.fn().mockImplementation(async (callbacks) => {
        // Handle both function and array of functions
        if (typeof callbacks === 'function') {
          return callbacks();
        }
        // Execute all callback functions and collect results
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
      assignStudentsToTrip: jest.fn().mockResolvedValue([
        { studentId: 'student-1', tripId: 'trip-1', assigned: true, assignmentId: 'assignment-1' },
      ]),
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

  describe('generateTripsForDate', () => {
    it('should return empty results when no timetables found', async () => {
      jest.spyOn(prismaService.timetable, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);

      const date = new Date('2026-07-30');
      const results = await service.generateTripsForDate(date);

      expect(results).toEqual([]);
    });

    it('should generate trips successfully when all conditions are met', async () => {
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

      const mockTrip = {
        id: 'trip-1',
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        date,
        departureTime: mockTimetable.startTime,
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
      jest.spyOn(tripsService, 'tripExists').mockResolvedValue(false);
      jest.spyOn(tripsService, 'createTrip').mockResolvedValue(mockTrip as any);
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

      // Mock transaction to return created trip
      jest.spyOn(prismaService as any, '$transaction').mockResolvedValue([mockTrip]);

      const results = await service.generateTripsForDate(date);

      expect(results).toHaveLength(1);
      expect(results[0].approved).toBe(true);
      expect(results[0].tripId).toBe('trip-1');
      // Transaction is called to create trips
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should skip route with no students', async () => {
      const date = new Date('2026-07-30');
      const mockTimetable = {
        id: 'timetable-1',
        routeId: 'route-1',
        startTime: new Date('2026-07-30T08:00:00Z'),
        endTime: new Date('2026-07-30T08:45:00Z'),
        type: 'CLASS',
      };

      jest
        .spyOn(prismaService.timetable, 'findMany')
        .mockResolvedValue([mockTimetable]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      const results = await service.generateTripsForDate(date);

      expect(results).toEqual([]);
    });

    it('should handle trip rejection when rule engine rejects', async () => {
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
      jest.spyOn(tripsService, 'tripExists').mockResolvedValue(false);
      jest.spyOn(ruleEngine, 'evaluate').mockResolvedValue({
        approved: false,
        ruleResults: [],
        criticalFailures: [
          {
            ruleId: 'TEST_RULE',
            ruleName: 'Test Rule',
            passed: false,
            isCritical: true,
            message: 'Test rejection',
            details: {},
            evaluatedAt: new Date(),
            evaluationTimeMs: 0,
            getSummary: () => 'Test rejection',
          },
        ],
        warnings: [],
        summary: 'Rejected',
        totalEvaluationTimeMs: 5,
        decidedAt: new Date(),
        getDetailedReport: () => 'Report',
      } as any);

      const results = await service.generateTripsForDate(date);

      expect(results).toHaveLength(1);
      expect(results[0].approved).toBe(false);
      expect(results[0].reason).toContain('Test rejection');
      expect(tripsService.createTrip).not.toHaveBeenCalled();
    });

    it('should handle existing trips', async () => {
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
      };

      jest
        .spyOn(prismaService.timetable, 'findMany')
        .mockResolvedValue([mockTimetable]);
      jest.spyOn(prismaService.route, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([mockStudent]);
      jest.spyOn(prismaService.bus, 'findMany').mockResolvedValue([mockBus]);
      jest.spyOn(prismaService.driver, 'findMany').mockResolvedValue([mockDriver]);
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue({ id: 'existing-trip' } as any);

      const results = await service.generateTripsForDate(date);

      expect(results.length).toBeGreaterThan(0);
      const duplicateResult = results.find(r => r.reason && r.reason.includes('Duplicate'));
      expect(duplicateResult).toBeDefined();
    });

    it('should throw error for invalid date', async () => {
      const invalidDate = new Date('invalid');

      await expect(service.generateTripsForDate(invalidDate)).rejects.toThrow();
    });
  });
});
