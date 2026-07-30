import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LocationUpdateService } from './location-update.service';
import { PrismaService } from '../../common/services/prisma.service';
import { TripStatus } from '@prisma/client';

describe('LocationUpdateService', () => {
  let service: LocationUpdateService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      trip: {
        findUnique: jest.fn(),
      },
      busLiveStatus: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        LocationUpdateService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LocationUpdateService>(LocationUpdateService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('updateLocation', () => {
    it('should update location for an active trip', async () => {
      const tripId = 'trip-1';
      const busId = 'bus-1';
      const mockTrip = {
        id: tripId,
        busId,
        status: TripStatus.IN_PROGRESS,
      };

      const mockLiveStatus = {
        id: 'status-1',
        busId,
        tripId,
        latitude: 28.6139,
        longitude: 77.209,
        speed: 30,
        timestamp: new Date(),
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.busLiveStatus, 'upsert').mockResolvedValue(mockLiveStatus as any);

      const result = await service.updateLocation({
        tripId,
        latitude: 28.6139,
        longitude: 77.209,
        speed: 30,
      });

      expect(result.tripId).toBe(tripId);
      expect(result.latitude).toBe(28.6139);
      expect(result.longitude).toBe(77.209);
      expect(result.speed).toBe(30);

      console.log('✓ Validation: Location update for active trip succeeds');
    });

    it('should reject update for inactive trip', async () => {
      const tripId = 'trip-1';
      const mockTrip = {
        id: tripId,
        busId: 'bus-1',
        status: TripStatus.SCHEDULED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(
        service.updateLocation({
          tripId,
          latitude: 28.6139,
          longitude: 77.209,
        }),
      ).rejects.toThrow(BadRequestException);

      console.log('✓ Validation: Inactive trip rejected');
    });

    it('should reject update for non-existent trip', async () => {
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateLocation({
          tripId: 'invalid-trip',
          latitude: 28.6139,
          longitude: 77.209,
        }),
      ).rejects.toThrow(BadRequestException);

      console.log('✓ Validation: Non-existent trip rejected');
    });

    it('should reject invalid coordinates', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await expect(
        service.updateLocation({
          tripId: 'trip-1',
          latitude: 91, // Invalid: > 90
          longitude: 77.209,
        }),
      ).rejects.toThrow(BadRequestException);

      console.log('✓ Validation: Invalid latitude rejected');
    });

    it('should handle multiple updates for same bus', async () => {
      const tripId1 = 'trip-1';
      const busId = 'bus-1';

      const mockTrip = {
        id: tripId1,
        busId,
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      let updateCount = 0;
      jest.spyOn(prismaService.busLiveStatus, 'upsert').mockImplementation(async () => {
        updateCount++;
        return {
          id: `status-${updateCount}`,
          busId,
          tripId: tripId1,
          latitude: 28.6 + updateCount * 0.001,
          longitude: 77.2 + updateCount * 0.001,
          speed: 30 + updateCount,
          timestamp: new Date(),
        } as any;
      });

      // First update
      await service.updateLocation({
        tripId: tripId1,
        latitude: 28.601,
        longitude: 77.201,
        speed: 30,
      });

      // Second update (should upsert, not create new)
      await service.updateLocation({
        tripId: tripId1,
        latitude: 28.602,
        longitude: 77.202,
        speed: 31,
      });

      expect(prismaService.busLiveStatus.upsert).toHaveBeenCalledTimes(2);
      expect(updateCount).toBe(2);

      console.log('✓ Validation: Multiple updates handled correctly');
    });

    it('should support optional fields', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
      };

      const mockLiveStatus = {
        id: 'status-1',
        busId: 'bus-1',
        tripId: 'trip-1',
        latitude: 28.6139,
        longitude: 77.209,
        speed: 0,
        heading: undefined,
        timestamp: new Date(),
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);
      jest.spyOn(prismaService.busLiveStatus, 'upsert').mockResolvedValue(mockLiveStatus as any);

      // Update without speed, heading, timestamp
      const result = await service.updateLocation({
        tripId: 'trip-1',
        latitude: 28.6139,
        longitude: 77.209,
      });

      expect(result.speed).toBe(0);
      expect(result.timestamp).toBeDefined();

      console.log('✓ Validation: Optional fields handled correctly');
    });

    it('should validate all coordinate ranges', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      const invalidCoordinates = [
        { lat: 91, lon: 0 },
        { lat: -91, lon: 0 },
        { lat: 0, lon: 181 },
        { lat: 0, lon: -181 },
      ];

      for (const coords of invalidCoordinates) {
        await expect(
          service.updateLocation({
            tripId: 'trip-1',
            latitude: coords.lat,
            longitude: coords.lon,
          }),
        ).rejects.toThrow(BadRequestException);
      }

      console.log('✓ Validation: All invalid coordinates rejected');
    });

    it('should accept boundary coordinate values', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      const mockLiveStatus = {
        id: 'status-1',
        busId: 'bus-1',
        tripId: 'trip-1',
        latitude: 90,
        longitude: 180,
        speed: 0,
        timestamp: new Date(),
      };

      jest.spyOn(prismaService.busLiveStatus, 'upsert').mockResolvedValue(mockLiveStatus as any);

      const result = await service.updateLocation({
        tripId: 'trip-1',
        latitude: 90,
        longitude: 180,
      });

      expect(result.latitude).toBe(90);
      expect(result.longitude).toBe(180);

      console.log('✓ Validation: Boundary coordinates accepted');
    });
  });

  describe('getBusLocation', () => {
    it('should return current location of a bus', async () => {
      const mockLocation = {
        id: 'status-1',
        busId: 'bus-1',
        latitude: 28.6139,
        longitude: 77.209,
      };

      jest.spyOn(prismaService.busLiveStatus, 'findUnique').mockResolvedValue(mockLocation as any);

      const result = await service.getBusLocation('bus-1');

      expect(result.busId).toBe('bus-1');
      expect(result.latitude).toBe(28.6139);
    });
  });
});
