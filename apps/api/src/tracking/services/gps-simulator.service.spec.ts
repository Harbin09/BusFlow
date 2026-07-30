import { Test, TestingModule } from '@nestjs/testing';
import { GPSSimulatorService } from './gps-simulator.service';
import { LocationUpdateService } from './location-update.service';
import { PrismaService } from '../../common/services/prisma.service';
import { TripStatus } from '@prisma/client';

describe('GPSSimulatorService', () => {
  let service: GPSSimulatorService;
  let locationService: LocationUpdateService;
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
      },
    };

    const mockLocationService = {
      updateLocation: jest.fn().mockResolvedValue({
        id: 'status-1',
        busId: 'bus-1',
        tripId: 'trip-1',
        latitude: 28.6139,
        longitude: 77.209,
        speed: 30,
        timestamp: new Date(),
        message: 'Location updated',
      }),
      getBusLocation: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        GPSSimulatorService,
        { provide: LocationUpdateService, useValue: mockLocationService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GPSSimulatorService>(GPSSimulatorService);
    locationService = module.get<LocationUpdateService>(LocationUpdateService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('startSimulation', () => {
    it('should start GPS simulation for a trip', async () => {
      const tripId = 'trip-1';
      const mockTrip = {
        id: tripId,
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [
            { id: 'stop-1', latitude: 28.6139, longitude: 77.209, order: 1 },
            { id: 'stop-2', latitude: 28.625, longitude: 77.22, order: 2 },
            { id: 'stop-3', latitude: 28.64, longitude: 77.23, order: 3 },
          ],
        },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await service.startSimulation(tripId);

      // Verify initial location update was sent
      expect(locationService.updateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          tripId,
          latitude: 28.6139,
          longitude: 77.209,
          speed: 0,
        }),
      );

      // Cleanup
      await service.stopSimulation(tripId);

      console.log('✓ Validation: GPS simulation started successfully');
    });

    it('should not start simulation for non-existent trip', async () => {
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(null);

      await service.startSimulation('invalid-trip');

      expect(locationService.updateLocation).not.toHaveBeenCalled();

      console.log('✓ Validation: Non-existent trip rejected');
    });

    it('should not start simulation for inactive trip', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.SCHEDULED,
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await service.startSimulation('trip-1');

      expect(locationService.updateLocation).not.toHaveBeenCalled();

      console.log('✓ Validation: Inactive trip rejected');
    });

    it('should not start simulation for route with < 2 stops', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [{ id: 'stop-1', latitude: 28.6139, longitude: 77.209, order: 1 }],
        },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await service.startSimulation('trip-1');

      expect(locationService.updateLocation).not.toHaveBeenCalled();

      console.log('✓ Validation: Route with < 2 stops rejected');
    });
  });

  describe('stopSimulation', () => {
    it('should stop GPS simulation', async () => {
      const tripId = 'trip-1';
      const mockTrip = {
        id: tripId,
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [
            { id: 'stop-1', latitude: 28.6139, longitude: 77.209, order: 1 },
            { id: 'stop-2', latitude: 28.625, longitude: 77.22, order: 2 },
          ],
        },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await service.startSimulation(tripId);
      const activeBefore = service.getActiveSimulations().length;

      await service.stopSimulation(tripId);
      const activeAfter = service.getActiveSimulations().length;

      expect(activeBefore).toBeGreaterThan(0);
      expect(activeAfter).toBe(activeBefore - 1);

      console.log('✓ Validation: GPS simulation stopped');
    });
  });

  describe('getActiveSimulations', () => {
    it('should return list of active simulations', async () => {
      const mockTrip = {
        id: 'trip-1',
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [
            { id: 'stop-1', latitude: 28.6139, longitude: 77.209, order: 1 },
            { id: 'stop-2', latitude: 28.625, longitude: 77.22, order: 2 },
          ],
        },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      await service.startSimulation('trip-1');

      const active = service.getActiveSimulations();
      expect(active).toContain('trip-1');

      await service.stopSimulation('trip-1');

      const activeAfter = service.getActiveSimulations();
      expect(activeAfter).not.toContain('trip-1');

      console.log('✓ Validation: Active simulations tracked correctly');
    });
  });

  describe('Multiple buses tracking', () => {
    it('should track multiple buses simultaneously', async () => {
      const createMockTrip = (id: string, busId: string) => ({
        id,
        busId,
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [
            { id: `${id}-stop-1`, latitude: 28.6 + Math.random() * 0.1, longitude: 77.2 + Math.random() * 0.1, order: 1 },
            { id: `${id}-stop-2`, latitude: 28.7 + Math.random() * 0.1, longitude: 77.3 + Math.random() * 0.1, order: 2 },
          ],
        },
      });

      jest.spyOn(prismaService.trip, 'findUnique').mockImplementation(async (args: any) => {
        if (args.where.id === 'trip-1') {
          return createMockTrip('trip-1', 'bus-1');
        } else if (args.where.id === 'trip-2') {
          return createMockTrip('trip-2', 'bus-2');
        }
        return null;
      });

      await service.startSimulation('trip-1');
      await service.startSimulation('trip-2');

      const active = service.getActiveSimulations();
      expect(active).toContain('trip-1');
      expect(active).toContain('trip-2');
      expect(active.length).toBe(2);

      await service.stopSimulation('trip-1');
      await service.stopSimulation('trip-2');

      console.log('✓ Validation: Multiple buses tracked simultaneously');
    });
  });

  describe('Coordinate generation', () => {
    it('should generate realistic coordinates between stops', async () => {
      const tripId = 'trip-1';
      const stop1 = { latitude: 28.6139, longitude: 77.209 };
      const stop2 = { latitude: 28.625, longitude: 77.22 };

      const mockTrip = {
        id: tripId,
        busId: 'bus-1',
        status: TripStatus.IN_PROGRESS,
        route: {
          stops: [
            { id: 'stop-1', ...stop1, order: 1 },
            { id: 'stop-2', ...stop2, order: 2 },
          ],
        },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip as any);

      let capturedLocations: any[] = [];
      (locationService.updateLocation as jest.Mock).mockImplementation(async (input) => {
        capturedLocations.push(input);
        return { ...input, id: 'status-1', timestamp: new Date(), message: 'Updated' };
      });

      await service.startSimulation(tripId);

      // Wait a bit for simulation to run
      await new Promise(resolve => setTimeout(resolve, 100));

      await service.stopSimulation(tripId);

      // Verify coordinates are between stops
      expect(capturedLocations.length).toBeGreaterThan(0);
      capturedLocations.forEach(loc => {
        expect(loc.latitude).toBeGreaterThanOrEqual(Math.min(stop1.latitude, stop2.latitude));
        expect(loc.latitude).toBeLessThanOrEqual(Math.max(stop1.latitude, stop2.latitude));
        expect(loc.longitude).toBeGreaterThanOrEqual(Math.min(stop1.longitude, stop2.longitude));
        expect(loc.longitude).toBeLessThanOrEqual(Math.max(stop1.longitude, stop2.longitude));
      });

      console.log(`✓ Validation: Generated ${capturedLocations.length} realistic coordinates`);
    });
  });
});
