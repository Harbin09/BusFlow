import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DriverWorkflowService } from './driver-workflow.service';
import { PrismaService } from '../../common/services/prisma.service';
import { TrackingService } from '../../tracking/services/tracking.service';
import { TripStatus } from '@prisma/client';

describe('DriverWorkflowService', () => {
  let service: DriverWorkflowService;
  let prismaService: PrismaService;
  let trackingService: TrackingService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      trip: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studentTripAssignment: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const mockTrackingService = {
      startTracking: jest.fn().mockResolvedValue(undefined),
      stopTracking: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      providers: [
        DriverWorkflowService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TrackingService, useValue: mockTrackingService },
      ],
    }).compile();

    service = module.get<DriverWorkflowService>(DriverWorkflowService);
    prismaService = module.get<PrismaService>(PrismaService);
    trackingService = module.get<TrackingService>(TrackingService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('getTodayTrip', () => {
    it('should return driver\'s trip for today', async () => {
      const driverId = 'driver-1';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockTrip = {
        id: 'trip-1',
        routeId: 'route-1',
        busId: 'bus-1',
        driverId,
        date: today,
        departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
        arrivalTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
        status: TripStatus.SCHEDULED,
        route: {
          id: 'route-1',
          name: 'Route A1',
        },
        bus: {
          id: 'bus-1',
          plateNumber: 'ABC123',
          capacity: 50,
        },
      };

      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(mockTrip as any);

      const result = await service.getTodayTrip(driverId);

      expect(result).toBeDefined();
      expect(result?.id).toBe('trip-1');
      expect(result?.status).toBe(TripStatus.SCHEDULED);
      expect(result?.route.name).toBe('Route A1');

      console.log('✓ Validation: Driver assigned trip retrieved');
    });

    it('should return null if no trip assigned today', async () => {
      const driverId = 'driver-1';

      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValue(null);

      const result = await service.getTodayTrip(driverId);

      expect(result).toBeNull();

      console.log('✓ Validation: No trip returns null');
    });
  });

  describe('startTrip', () => {
    it('should start a SCHEDULED trip and activate tracking', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
        status: TripStatus.SCHEDULED,
      };

      const updatedTrip = {
        id: tripId,
        driverId,
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.trip, 'update').mockResolvedValue(updatedTrip as any);

      await service.startTrip(driverId, tripId);

      // Verify trip was updated
      expect(prismaService.trip.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: { status: TripStatus.IN_PROGRESS },
      });

      // Verify tracking was started
      expect(trackingService.startTracking).toHaveBeenCalledWith(tripId);

      console.log('✓ Validation: Trip started successfully');
    });

    it('should reject if driver does not own the trip', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId: 'driver-2', // Different driver
        status: TripStatus.SCHEDULED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(service.startTrip(driverId, tripId)).rejects.toThrow(
        ForbiddenException,
      );

      console.log('✓ Validation: Unauthorized driver rejected');
    });

    it('should reject if trip does not exist', async () => {
      const driverId = 'driver-1';
      const tripId = 'invalid-trip';

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(null);

      await expect(service.startTrip(driverId, tripId)).rejects.toThrow(
        NotFoundException,
      );

      console.log('✓ Validation: Non-existent trip rejected');
    });

    it('should reject if trip is not SCHEDULED', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
        status: TripStatus.COMPLETED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(service.startTrip(driverId, tripId)).rejects.toThrow(
        BadRequestException,
      );

      console.log('✓ Validation: Wrong status rejected');
    });
  });

  describe('endTrip', () => {
    it('should complete an IN_PROGRESS trip and stop tracking', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
        status: TripStatus.IN_PROGRESS,
      };

      const updatedTrip = {
        id: tripId,
        driverId,
        status: TripStatus.COMPLETED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.trip, 'update').mockResolvedValue(updatedTrip as any);

      await service.endTrip(driverId, tripId);

      // Verify tracking was stopped
      expect(trackingService.stopTracking).toHaveBeenCalledWith(tripId);

      // Verify trip was updated
      expect(prismaService.trip.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED },
      });

      console.log('✓ Validation: Trip completed successfully');
    });

    it('should reject if driver does not own the trip', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId: 'driver-2', // Different driver
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(service.endTrip(driverId, tripId)).rejects.toThrow(
        ForbiddenException,
      );

      console.log('✓ Validation: Unauthorized driver cannot end trip');
    });

    it('should reject if trip is not IN_PROGRESS', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
        status: TripStatus.SCHEDULED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(service.endTrip(driverId, tripId)).rejects.toThrow(
        BadRequestException,
      );

      console.log('✓ Validation: Non-active trip cannot be ended');
    });
  });

  describe('getPassengerList', () => {
    it('should return passenger list with pickup stops', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
        status: TripStatus.IN_PROGRESS,
      };

      const mockAssignments = [
        {
          id: 'assignment-1',
          studentId: 'student-1',
          status: 'SCHEDULED',
          boardingTime: null,
          alightingTime: null,
          student: {
            id: 'student-1',
            studentNo: 'S001',
            user: {
              name: 'John Doe',
            },
          },
          boardingStop: {
            id: 'stop-1',
            name: 'Stop A',
            latitude: 28.6139,
            longitude: 77.209,
          },
        },
        {
          id: 'assignment-2',
          studentId: 'student-2',
          status: 'SCHEDULED',
          boardingTime: null,
          alightingTime: null,
          student: {
            id: 'student-2',
            studentNo: 'S002',
            user: {
              name: 'Jane Smith',
            },
          },
          boardingStop: {
            id: 'stop-2',
            name: 'Stop B',
            latitude: 28.625,
            longitude: 77.22,
          },
        },
      ];

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest
        .spyOn(prismaService.studentTripAssignment, 'findMany')
        .mockResolvedValue(mockAssignments as any);

      const result = await service.getPassengerList(driverId, tripId);

      expect(result).toHaveLength(2);
      expect(result[0].studentNo).toBe('S001');
      expect(result[0].studentName).toBe('John Doe');
      expect(result[0].boardingStop?.name).toBe('Stop A');

      console.log('✓ Validation: Passenger list retrieved successfully');
    });

    it('should reject if driver does not own the trip', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId: 'driver-2', // Different driver
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(service.getPassengerList(driverId, tripId)).rejects.toThrow(
        ForbiddenException,
      );

      console.log('✓ Validation: Unauthorized driver cannot view passengers');
    });

    it('should return empty list if no assignments', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest
        .spyOn(prismaService.studentTripAssignment, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getPassengerList(driverId, tripId);

      expect(result).toEqual([]);

      console.log('✓ Validation: No passengers returns empty list');
    });
  });

  describe('getExpectedPassengerCount', () => {
    it('should return total passenger count for trip', async () => {
      jest.spyOn(prismaService.studentTripAssignment, 'count').mockResolvedValue(5);

      const count = await service.getExpectedPassengerCount('trip-1');

      expect(count).toBe(5);

      console.log('✓ Validation: Expected passenger count retrieved');
    });
  });

  describe('getActivePassengerCount', () => {
    it('should return count of active passengers', async () => {
      jest.spyOn(prismaService.studentTripAssignment, 'count').mockResolvedValue(4);

      const count = await service.getActivePassengerCount('trip-1');

      expect(count).toBe(4);

      expect(prismaService.studentTripAssignment.count).toHaveBeenCalledWith({
        where: {
          tripId: 'trip-1',
          status: {
            in: ['SCHEDULED', 'BOARDED', 'ALIGHTED'],
          },
        },
      });

      console.log('✓ Validation: Active passenger count retrieved');
    });
  });

  describe('Authorization', () => {
    it('should enforce driver authorization across all operations', async () => {
      const authenticatedDriver = 'driver-1';
      const otherDriver = 'driver-2';
      const tripId = 'trip-1';

      const mockTrip = {
        id: tripId,
        driverId: otherDriver,
        status: TripStatus.SCHEDULED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      // Test getTodayTrip with correct driver
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValueOnce(mockTrip as any);
      const result = await service.getTodayTrip(authenticatedDriver);
      expect(result?.id).toBe(tripId);

      // Test startTrip with wrong driver
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValueOnce(mockTrip as any);
      await expect(service.startTrip(authenticatedDriver, tripId)).rejects.toThrow(
        ForbiddenException,
      );

      // Test getPassengerList with wrong driver
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValueOnce(mockTrip as any);
      await expect(
        service.getPassengerList(authenticatedDriver, tripId),
      ).rejects.toThrow(ForbiddenException);

      console.log('✓ Validation: Authorization enforced across all operations');
    });
  });

  describe('Trip Workflow', () => {
    it('should handle complete trip lifecycle', async () => {
      const driverId = 'driver-1';
      const tripId = 'trip-1';

      const scheduledTrip = {
        id: tripId,
        driverId,
        status: TripStatus.SCHEDULED,
        route: { id: 'route-1', name: 'Route A' },
        bus: { id: 'bus-1', plateNumber: 'ABC123', capacity: 50 },
      };

      const activeTrip = {
        ...scheduledTrip,
        status: TripStatus.IN_PROGRESS,
      };

      const completedTrip = {
        ...scheduledTrip,
        status: TripStatus.COMPLETED,
      };

      // Get today's trip
      jest.spyOn(prismaService.trip, 'findFirst').mockResolvedValueOnce(scheduledTrip as any);
      const todayTrip = await service.getTodayTrip(driverId);
      expect(todayTrip?.status).toBe(TripStatus.SCHEDULED);

      // Start trip
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValueOnce(scheduledTrip as any);
      jest.spyOn(prismaService.trip, 'update').mockResolvedValueOnce(activeTrip as any);
      await service.startTrip(driverId, tripId);

      // Get passengers
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValueOnce(activeTrip as any);
      jest.spyOn(prismaService.studentTripAssignment, 'findMany').mockResolvedValueOnce([] as any);
      const passengers = await service.getPassengerList(driverId, tripId);
      expect(passengers).toBeDefined();

      // End trip
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValueOnce(activeTrip as any);
      jest.spyOn(prismaService.trip, 'update').mockResolvedValueOnce(completedTrip as any);
      await service.endTrip(driverId, tripId);

      console.log('✓ Validation: Complete trip lifecycle handled');
    });
  });
});
