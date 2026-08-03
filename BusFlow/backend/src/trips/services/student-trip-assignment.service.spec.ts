import { Test, TestingModule } from '@nestjs/testing';
import { StudentTripAssignmentService } from './student-trip-assignment.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('StudentTripAssignmentService', () => {
  let service: StudentTripAssignmentService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      trip: {
        findUnique: jest.fn(),
      },
      student: {
        findMany: jest.fn(),
      },
      studentTripAssignment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        StudentTripAssignmentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StudentTripAssignmentService>(StudentTripAssignmentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('assignStudentsToTrip', () => {
    it('should assign all eligible students to a trip', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 },
        route: { id: 'route-1', name: 'Route A1' },
      };

      const mockStudents = [
        {
          id: 'student-1',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-1',
              date,
              status: 'PRESENT',
            },
          ],
        },
        {
          id: 'student-2',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-2',
              date,
              status: 'PRESENT',
            },
          ],
        },
        {
          id: 'student-3',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-3',
              date,
              status: 'PRESENT',
            },
          ],
        },
      ];

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);
      jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue(null);

      let assignmentCount = 0;
      jest
        .spyOn(prismaService.studentTripAssignment, 'create')
        .mockImplementation(async () => {
          assignmentCount++;
          return {
            id: `assignment-${assignmentCount}`,
            studentId: `student-${assignmentCount}`,
            tripId,
            status: 'SCHEDULED',
          } as any;
        });

      const results = await service.assignStudentsToTrip(tripId, date);

      const assigned = results.filter(r => r.assigned);
      expect(assigned).toHaveLength(3);
      expect(assigned[0].assignmentId).toBe('assignment-1');
      expect(assigned[1].assignmentId).toBe('assignment-2');
      expect(assigned[2].assignmentId).toBe('assignment-3');

      console.log('✓ Validation: All eligible students assigned to trip');
      console.log(`  - Route: route-1`);
      console.log(`  - Students found: 3`);
      console.log(`  - Students assigned: ${assigned.length}`);
    });

    it('should exclude absent students from assignment', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 },
        route: { id: 'route-1', name: 'Route A1' },
      };

      const mockStudents = [
        {
          id: 'student-1',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-1',
              date,
              status: 'PRESENT',
            },
          ],
        },
        {
          id: 'student-2',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-2',
              date,
              status: 'ABSENT',
            },
          ],
        },
        {
          id: 'student-3',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-3',
              date,
              status: 'REQUESTED_LEAVE',
            },
          ],
        },
      ];

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);
      jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.studentTripAssignment, 'create').mockResolvedValue({
        id: 'assignment-1',
        studentId: 'student-1',
        tripId,
        status: 'SCHEDULED',
      } as any);

      const results = await service.assignStudentsToTrip(tripId, date);

      const assigned = results.filter(r => r.assigned);
      const skipped = results.filter(r => !r.assigned);

      expect(assigned).toHaveLength(1);
      expect(skipped).toHaveLength(2);

      const absentResult = skipped.find(r => r.studentId === 'student-2');
      const leaveResult = skipped.find(r => r.studentId === 'student-3');

      expect(absentResult?.reason).toContain('ABSENT');
      expect(leaveResult?.reason).toContain('REQUESTED_LEAVE');

      console.log('✓ Validation: Absent students excluded from assignment');
      console.log(`  - PRESENT students: 1 assigned`);
      console.log(`  - ABSENT students: skipped`);
      console.log(`  - REQUESTED_LEAVE students: skipped`);
    });

    it('should allow LATE_PICKUP students', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 },
        route: { id: 'route-1', name: 'Route A1' },
      };

      const mockStudents = [
        {
          id: 'student-1',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-1',
              date,
              status: 'LATE_PICKUP',
            },
          ],
        },
      ];

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);
      jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.studentTripAssignment, 'create').mockResolvedValue({
        id: 'assignment-1',
        studentId: 'student-1',
        tripId,
        status: 'SCHEDULED',
      } as any);

      const results = await service.assignStudentsToTrip(tripId, date);

      const assigned = results.filter(r => r.assigned);
      expect(assigned).toHaveLength(1);

      console.log('✓ Validation: LATE_PICKUP students included in assignment');
    });

    it('should prevent duplicate assignments', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 },
        route: { id: 'route-1', name: 'Route A1' },
      };

      const mockStudents = [
        {
          id: 'student-1',
          routeId: 'route-1',
          pickupStopId: 'stop-1',
          dailyStatus: [
            {
              id: 'status-1',
              date,
              status: 'PRESENT',
            },
          ],
        },
      ];

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);

      // Mock: assignment already exists
      jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue({
        id: 'existing-assignment',
        studentId: 'student-1',
        tripId,
        status: 'SCHEDULED',
      } as any);

      const results = await service.assignStudentsToTrip(tripId, date);

      const assigned = results.filter(r => r.assigned);
      const skipped = results.filter(r => !r.assigned);

      expect(assigned).toHaveLength(0);
      expect(skipped).toHaveLength(1);
      expect(skipped[0].reason).toContain('already assigned');

      console.log('✓ Validation: Duplicate assignments prevented');
      console.log(`  - Existing assignment found: skipped`);
    });

    it('should respect bus capacity constraints (90% safe capacity)', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 }, // Safe capacity = 45
        route: { id: 'route-1', name: 'Route A1' },
      };

      // Create 50 students
      const mockStudents = Array.from({ length: 50 }, (_, i) => ({
        id: `student-${i + 1}`,
        routeId: 'route-1',
        pickupStopId: 'stop-1',
        dailyStatus: [
          {
            id: `status-${i + 1}`,
            date,
            status: 'PRESENT',
          },
        ],
      }));

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);
      jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue(null);

      let assignmentCount = 0;
      jest
        .spyOn(prismaService.studentTripAssignment, 'create')
        .mockImplementation(async () => {
          assignmentCount++;
          return {
            id: `assignment-${assignmentCount}`,
            studentId: `student-${assignmentCount}`,
            tripId,
            status: 'SCHEDULED',
          } as any;
        });

      const results = await service.assignStudentsToTrip(tripId, date);

      const assigned = results.filter(r => r.assigned);
      const skipped = results.filter(r => !r.assigned);

      // Safe capacity is 45 (50 * 0.9)
      expect(assigned).toHaveLength(45);
      expect(skipped).toHaveLength(5);

      const capacityExceeded = skipped.every(r => r.reason?.includes('capacity exceeded'));
      expect(capacityExceeded).toBe(true);

      console.log('✓ Validation: Bus capacity constraints respected');
      console.log(`  - Bus capacity: 50`);
      console.log(`  - Safe capacity (90%): 45`);
      console.log(`  - Students assigned: ${assigned.length}`);
      console.log(`  - Students skipped (capacity): ${skipped.length}`);
    });

    it('should handle multiple trips with different students', async () => {
      const date = new Date('2026-07-30');
      const trips = [
        { tripId: 'trip-1', routeId: 'route-1' },
        { tripId: 'trip-2', routeId: 'route-2' },
      ];

      const results = [];

      for (const tripInfo of trips) {
        const mockTrip = {
          id: tripInfo.tripId,
          routeId: tripInfo.routeId,
          busId: `bus-${tripInfo.routeId}`,
          date,
          bus: { id: `bus-${tripInfo.routeId}`, capacity: 50 },
          route: { id: tripInfo.routeId, name: `Route ${tripInfo.routeId}` },
        };

        const mockStudents = [
          {
            id: `student-1-${tripInfo.routeId}`,
            routeId: tripInfo.routeId,
            pickupStopId: 'stop-1',
            dailyStatus: [
              {
                id: `status-1-${tripInfo.routeId}`,
                date,
                status: 'PRESENT',
              },
            ],
          },
          {
            id: `student-2-${tripInfo.routeId}`,
            routeId: tripInfo.routeId,
            pickupStopId: 'stop-1',
            dailyStatus: [
              {
                id: `status-2-${tripInfo.routeId}`,
                date,
                status: 'PRESENT',
              },
            ],
          },
        ];

        jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
        jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(mockStudents as any);
        jest.spyOn(prismaService.studentTripAssignment, 'findUnique').mockResolvedValue(null);

        let assignmentCount = 0;
        jest
          .spyOn(prismaService.studentTripAssignment, 'create')
          .mockImplementation(async () => {
            assignmentCount++;
            return {
              id: `assignment-${tripInfo.tripId}-${assignmentCount}`,
              studentId: `student-${assignmentCount}-${tripInfo.routeId}`,
              tripId: tripInfo.tripId,
              status: 'SCHEDULED',
            } as any;
          });

        const tripResults = await service.assignStudentsToTrip(tripInfo.tripId, date);
        results.push({ trip: tripInfo.tripId, results: tripResults });
      }

      // Verify separate assignments for each trip
      results.forEach(({ trip, results: tripResults }) => {
        const assigned = tripResults.filter(r => r.assigned);
        expect(assigned).toHaveLength(2);
        assigned.forEach(a => {
          expect(a.tripId).toBe(trip);
        });
      });

      console.log('✓ Validation: Multiple trips handled independently');
      console.log(`  - Trip 1: 2 students assigned`);
      console.log(`  - Trip 2: 2 students assigned`);
      console.log(`  - No cross-trip assignments`);
    });

    it('should handle missing route students', async () => {
      const date = new Date('2026-07-30');
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        routeId: 'route-1',
        busId: 'bus-1',
        date,
        bus: { id: 'bus-1', capacity: 50 },
        route: { id: 'route-1', name: 'Route A1' },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue([]);

      const results = await service.assignStudentsToTrip(tripId, date);

      expect(results).toHaveLength(0);

      console.log('✓ Validation: Missing route students handled gracefully');
      console.log(`  - Students found: 0`);
      console.log(`  - Assignments created: 0`);
    });
  });

  describe('getAssignmentsForTrip', () => {
    it('should return all assignments for a trip', async () => {
      const tripId = 'trip-1';

      const mockAssignments = [
        {
          id: 'assignment-1',
          studentId: 'student-1',
          tripId,
          status: 'SCHEDULED',
          student: { id: 'student-1', studentNo: 'S001' },
        },
        {
          id: 'assignment-2',
          studentId: 'student-2',
          tripId,
          status: 'SCHEDULED',
          student: { id: 'student-2', studentNo: 'S002' },
        },
      ];

      jest
        .spyOn(prismaService.studentTripAssignment, 'findMany')
        .mockResolvedValue(mockAssignments as any);

      const results = await service.getAssignmentsForTrip(tripId);

      expect(results).toHaveLength(2);
      expect(results[0].studentId).toBe('student-1');
      expect(results[1].studentId).toBe('student-2');
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should update assignment status', async () => {
      const assignmentId = 'assignment-1';

      const mockAssignment = {
        id: assignmentId,
        studentId: 'student-1',
        tripId: 'trip-1',
        status: 'BOARDED',
        boardingTime: new Date(),
        student: { id: 'student-1' },
        trip: { id: 'trip-1' },
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'update')
        .mockResolvedValue(mockAssignment as any);

      const result = await service.updateAssignmentStatus(assignmentId, 'BOARDED');

      expect(result.status).toBe('BOARDED');
      expect(prismaService.studentTripAssignment.update).toHaveBeenCalledWith({
        where: { id: assignmentId },
        data: {
          status: 'BOARDED',
          updatedAt: expect.any(Date),
        },
        include: {
          student: true,
          trip: true,
          boardingStop: true,
        },
      });
    });
  });

  describe('countAssignmentsForTrip', () => {
    it('should count total assignments for a trip', async () => {
      jest.spyOn(prismaService.studentTripAssignment, 'count').mockResolvedValue(5);

      const count = await service.countAssignmentsForTrip('trip-1');

      expect(count).toBe(5);
    });
  });

  describe('countActiveAssignmentsForTrip', () => {
    it('should count active assignments only', async () => {
      jest.spyOn(prismaService.studentTripAssignment, 'count').mockResolvedValue(4);

      const count = await service.countActiveAssignmentsForTrip('trip-1');

      expect(count).toBe(4);
      expect(prismaService.studentTripAssignment.count).toHaveBeenCalledWith({
        where: {
          tripId: 'trip-1',
          status: {
            in: ['SCHEDULED', 'BOARDED', 'ALIGHTED'],
          },
        },
      });
    });
  });
});
