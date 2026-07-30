import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { StudentWorkflowService } from './student-workflow.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('StudentWorkflowService', () => {
  let service: StudentWorkflowService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      studentTripAssignment: {
        findFirst: jest.fn(),
      },
      busLiveStatus: {
        findUnique: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        StudentWorkflowService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StudentWorkflowService>(StudentWorkflowService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('getTodayTrip', () => {
    it('should return student\'s trip with bus and driver info for today', async () => {
      const studentId = 'student-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId: 'trip-1',
        status: 'SCHEDULED' as const,
        boardingTime: null,
        boardingStopId: 'stop-1',
        trip: {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date: today,
          departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
          arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
          route: {
            id: 'route-1',
            name: 'Route A1',
          },
          bus: {
            id: 'bus-1',
            plateNumber: 'ABC123',
          },
          driver: {
            id: 'driver-1',
            user: {
              name: 'John Driver',
            },
          },
        },
        boardingStop: {
          id: 'stop-1',
          name: 'School Gate',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(mockAssignment as any);

      const result = await service.getTodayTrip(studentId);

      expect(result).toBeDefined();
      expect(result?.tripId).toBe('trip-1');
      expect(result?.busPlateNumber).toBe('ABC123');
      expect(result?.driverName).toBe('John Driver');
      expect(result?.routeName).toBe('Route A1');
      expect(result?.pickupStop.name).toBe('School Gate');
      expect(result?.assignmentStatus).toBe('SCHEDULED' as const);

      console.log('✓ Validation: Student with active trip retrieved');
    });

    it('should return null if student has no trip today', async () => {
      const studentId = 'student-2';

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.getTodayTrip(studentId);

      expect(result).toBeNull();

      console.log('✓ Validation: Student without trip returns null');
    });

    it('should include boarding time if student already boarded', async () => {
      const studentId = 'student-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const boardingTime = new Date(today.getTime() + 2.5 * 60 * 60 * 1000);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId: 'trip-1',
        status: 'BOARDED' as const,
        boardingTime,
        boardingStopId: 'stop-1',
        trip: {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date: today,
          departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
          arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
          route: {
            id: 'route-1',
            name: 'Route A1',
          },
          bus: {
            id: 'bus-1',
            plateNumber: 'ABC123',
          },
          driver: {
            id: 'driver-1',
            user: {
              name: 'John Driver',
            },
          },
        },
        boardingStop: {
          id: 'stop-1',
          name: 'School Gate',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(mockAssignment as any);

      const result = await service.getTodayTrip(studentId);

      expect(result?.boardingTime).toEqual(boardingTime);
      expect(result?.assignmentStatus).toBe('BOARDED' as const);

      console.log('✓ Validation: Boarding time included for boarded student');
    });
  });

  describe('getBusLocation', () => {
    it('should return current bus location if student is assigned to trip with that bus', async () => {
      const studentId = 'student-1';
      const busId = 'bus-1';
      const tripId = 'trip-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId,
        trip: {
          busId,
        },
      };

      const mockBusStatus = {
        busId,
        tripId,
        latitude: 28.6139,
        longitude: 77.2090,
        speed: 45.5,
        heading: 180,
        timestamp: new Date(),
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      jest
        .spyOn(prismaService.busLiveStatus, 'findUnique')
        .mockResolvedValue(mockBusStatus as any);

      const result = await service.getBusLocation(studentId, busId);

      expect(result).toBeDefined();
      expect(result?.busId).toBe('bus-1');
      expect(result?.latitude).toBe(28.6139);
      expect(result?.longitude).toBe(77.2090);
      expect(result?.speed).toBe(45.5);
      expect(result?.heading).toBe(180);

      console.log('✓ Validation: Bus location retrieved successfully');
    });

    it('should return null if bus has no location data yet', async () => {
      const studentId = 'student-1';
      const busId = 'bus-1';
      const tripId = 'trip-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId,
        trip: {
          busId,
        },
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      jest
        .spyOn(prismaService.busLiveStatus, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.getBusLocation(studentId, busId);

      expect(result).toBeNull();

      console.log('✓ Validation: No location data returns null');
    });

    it('should reject if student is not assigned to trip with this bus', async () => {
      const studentId = 'student-1';
      const busId = 'bus-2'; // Different bus
      const studentsBusId = 'bus-1';

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(null); // No assignment with this bus

      await expect(
        service.getBusLocation(studentId, busId),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.busLiveStatus.findUnique).not.toHaveBeenCalled();

      console.log('✓ Validation: Unauthorized bus access rejected');
    });

    it('should throw ForbiddenException with helpful message for unauthorized access', async () => {
      const studentId = 'student-1';
      const busId = 'bus-2';

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(null);

      try {
        await service.getBusLocation(studentId, busId);
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('not part of your assigned trip');
      }

      console.log('✓ Validation: Forbidden exception has helpful message');
    });
  });

  describe('verifyStudentTrip', () => {
    it('should verify student is assigned to trip without error', async () => {
      const studentId = 'student-1';
      const tripId = 'trip-1';

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId,
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(mockAssignment as any);

      // Should not throw
      await expect(
        service.verifyStudentTrip(studentId, tripId),
      ).resolves.not.toThrow();

      console.log('✓ Validation: Student trip verified');
    });

    it('should reject if student is not assigned to trip', async () => {
      const studentId = 'student-1';
      const tripId = 'trip-1';

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.verifyStudentTrip(studentId, tripId),
      ).rejects.toThrow(ForbiddenException);

      console.log('✓ Validation: Unauthorized student rejected');
    });
  });

  describe('Authorization', () => {
    it('should enforce authorization - student can only access own trip', async () => {
      const studentId = 'student-1';
      const otherStudentId = 'student-2';
      const tripId = 'trip-1';

      // Mock: student-1 assigned to trip-1
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockImplementation(async (args: any) => {
          if (args.where?.studentId === studentId && args.where?.tripId === tripId) {
            return { id: 'assignment-1', studentId, tripId } as any;
          }
          return null;
        });

      // Student 1 can access
      await expect(
        service.verifyStudentTrip(studentId, tripId),
      ).resolves.not.toThrow();

      // Student 2 cannot access
      await expect(
        service.verifyStudentTrip(otherStudentId, tripId),
      ).rejects.toThrow(ForbiddenException);

      console.log('✓ Validation: Authorization enforced - students isolated');
    });

    it('should prevent student from accessing other students\' trip bus locations', async () => {
      const studentId = 'student-1';
      const busId = 'bus-1';

      // No assignment for this student with this bus
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.getBusLocation(studentId, busId),
      ).rejects.toThrow(ForbiddenException);

      console.log('✓ Validation: Cross-student access prevented');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle student journey: view trip, check bus location, board, and reboard', async () => {
      const studentId = 'student-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId: 'trip-1',
        status: 'SCHEDULED' as const,
        boardingTime: null,
        boardingStopId: 'stop-1',
        trip: {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date: today,
          departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
          arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
          route: {
            id: 'route-1',
            name: 'Route A1',
          },
          bus: {
            id: 'bus-1',
            plateNumber: 'ABC123',
          },
          driver: {
            id: 'driver-1',
            user: {
              name: 'John Driver',
            },
          },
        },
        boardingStop: {
          id: 'stop-1',
          name: 'School Gate',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      };

      const mockBusStatus = {
        busId: 'bus-1',
        tripId: 'trip-1',
        latitude: 28.613,
        longitude: 77.209,
        speed: 30,
        heading: 90,
        timestamp: new Date(),
      };

      // Step 1: Student checks today's trip
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      const trip = await service.getTodayTrip(studentId);
      expect(trip?.tripId).toBe('trip-1');
      expect(trip?.busPlateNumber).toBe('ABC123');

      // Step 2: Student checks bus location
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      jest
        .spyOn(prismaService.busLiveStatus, 'findUnique')
        .mockResolvedValueOnce(mockBusStatus as any);

      const location = await service.getBusLocation(studentId, 'bus-1');
      expect(location?.latitude).toBe(28.613);

      // Step 3: Verify student can check their own trip
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      await expect(
        service.verifyStudentTrip(studentId, 'trip-1'),
      ).resolves.not.toThrow();

      console.log('✓ Validation: Complete student journey workflow');
    });

    it('should handle multiple students on same trip', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment1 = {
        id: 'assignment-1',
        studentId: 'student-1',
        tripId: 'trip-1',
        status: 'SCHEDULED' as const,
        boardingTime: null,
        boardingStopId: 'stop-1',
        trip: {
          id: 'trip-1',
          busId: 'bus-1',
          route: { id: 'route-1', name: 'Route A1' },
          bus: { id: 'bus-1', plateNumber: 'ABC123' },
          driver: { id: 'driver-1', user: { name: 'John Driver' } },
          date: today,
          departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
          arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
        },
        boardingStop: {
          id: 'stop-1',
          name: 'School Gate',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      };

      const mockAssignment2 = {
        ...mockAssignment1,
        id: 'assignment-2',
        studentId: 'student-2',
        boardingStopId: 'stop-2',
        boardingStop: {
          id: 'stop-2',
          name: 'Market',
          latitude: 28.625,
          longitude: 77.22,
        },
      };

      // Student 1 retrieves trip
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment1 as any);

      const trip1 = await service.getTodayTrip('student-1');
      expect(trip1?.pickupStop.name).toBe('School Gate');

      // Student 2 retrieves trip (same trip, different pickup stop)
      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment2 as any);

      const trip2 = await service.getTodayTrip('student-2');
      expect(trip2?.pickupStop.name).toBe('Market');

      // Both see same bus
      expect(trip1?.busId).toBe(trip2?.busId);

      console.log('✓ Validation: Multiple students on same trip handled');
    });
  });

  describe('Edge Cases', () => {
    it('should handle assignment with no boarding stop', async () => {
      const studentId = 'student-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId: 'trip-1',
        status: 'SCHEDULED' as const,
        boardingTime: null,
        boardingStopId: null, // No stop assigned
        boardingStop: null,
        trip: {
          id: 'trip-1',
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          date: today,
          departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
          arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
          route: { id: 'route-1', name: 'Route A1' },
          bus: { id: 'bus-1', plateNumber: 'ABC123' },
          driver: { id: 'driver-1', user: { name: 'John Driver' } },
        },
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValue(mockAssignment as any);

      const result = await service.getTodayTrip(studentId);

      expect(result?.pickupStop).toBeDefined();
      expect(result?.pickupStop.name).toBe('Not assigned');

      console.log('✓ Validation: Missing pickup stop handled gracefully');
    });

    it('should handle bus with no heading data', async () => {
      const studentId = 'student-1';
      const busId = 'bus-1';
      const tripId = 'trip-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAssignment = {
        id: 'assignment-1',
        studentId,
        tripId,
        trip: { busId },
      };

      const mockBusStatus = {
        busId,
        tripId,
        latitude: 28.6139,
        longitude: 77.2090,
        speed: 0,
        heading: null, // No heading
        timestamp: new Date(),
      };

      jest
        .spyOn(prismaService.studentTripAssignment, 'findFirst')
        .mockResolvedValueOnce(mockAssignment as any);

      jest
        .spyOn(prismaService.busLiveStatus, 'findUnique')
        .mockResolvedValue(mockBusStatus as any);

      const result = await service.getBusLocation(studentId, busId);

      expect(result?.heading).toBeUndefined();
      expect(result?.speed).toBe(0);

      console.log('✓ Validation: Missing heading handled');
    });
  });
});
