import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('TripsService', () => {
  let service: TripsService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockPrismaService = {
      trip: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createTrip', () => {
    it('should create a trip successfully', async () => {
      const mockTrip = {
        id: 'trip-1',
        routeId: 'route-1',
        busId: 'bus-1',
        driverId: 'driver-1',
        date: new Date(),
        status: 'SCHEDULED',
      };

      jest.spyOn(prismaService.trip, 'create').mockResolvedValue(mockTrip);

      const result = await service.createTrip({
        route: { connect: { id: 'route-1' } },
        bus: { connect: { id: 'bus-1' } },
        driver: { connect: { id: 'driver-1' } },
        date: new Date(),
        departureTime: new Date(),
        status: 'SCHEDULED',
        generatedByRuleEngine: true,
      });

      expect(result).toEqual(mockTrip);
      expect(prismaService.trip.create).toHaveBeenCalled();
    });
  });

  describe('createManyTrips', () => {
    it('should create multiple trips', async () => {
      const mockTrips = [
        { id: 'trip-1', routeId: 'route-1', status: 'SCHEDULED' },
        { id: 'trip-2', routeId: 'route-2', status: 'SCHEDULED' },
      ];

      jest
        .spyOn(prismaService.trip, 'create')
        .mockResolvedValueOnce(mockTrips[0])
        .mockResolvedValueOnce(mockTrips[1]);

      const results = await service.createManyTrips([
        {
          route: { connect: { id: 'route-1' } },
          bus: { connect: { id: 'bus-1' } },
          driver: { connect: { id: 'driver-1' } },
          date: new Date(),
          departureTime: new Date(),
          status: 'SCHEDULED',
          generatedByRuleEngine: true,
        },
        {
          route: { connect: { id: 'route-2' } },
          bus: { connect: { id: 'bus-2' } },
          driver: { connect: { id: 'driver-2' } },
          date: new Date(),
          departureTime: new Date(),
          status: 'SCHEDULED',
          generatedByRuleEngine: true,
        },
      ]);

      expect(results).toHaveLength(2);
    });
  });

  describe('getTrip', () => {
    it('should return a trip by id', async () => {
      const mockTrip = {
        id: 'trip-1',
        routeId: 'route-1',
        route: { stops: [] },
      };

      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip);

      const result = await service.getTrip('trip-1');

      expect(result).toEqual(mockTrip);
      expect(prismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
        include: expect.any(Object),
      });
    });

    it('should return null if trip not found', async () => {
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(null);

      const result = await service.getTrip('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTripsForDate', () => {
    it('should return trips for a given date', async () => {
      const date = new Date('2026-07-30');
      const mockTrips = [
        {
          id: 'trip-1',
          date: new Date('2026-07-30T08:00:00Z'),
          departureTime: new Date('2026-07-30T08:00:00Z'),
        },
        {
          id: 'trip-2',
          date: new Date('2026-07-30T14:00:00Z'),
          departureTime: new Date('2026-07-30T14:00:00Z'),
        },
      ];

      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue(mockTrips);

      const results = await service.getTripsForDate(date);

      expect(results).toHaveLength(2);
      expect(prismaService.trip.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no trips found', async () => {
      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue([]);

      const results = await service.getTripsForDate(new Date('2026-07-30'));

      expect(results).toEqual([]);
    });
  });

  describe('getTripsForRouteAndDate', () => {
    it('should return trips for a specific route and date', async () => {
      const mockTrips = [
        {
          id: 'trip-1',
          routeId: 'route-1',
          departureTime: new Date('2026-07-30T08:00:00Z'),
        },
      ];

      jest.spyOn(prismaService.trip, 'findMany').mockResolvedValue(mockTrips);

      const results = await service.getTripsForRouteAndDate(
        'route-1',
        new Date('2026-07-30'),
      );

      expect(results).toHaveLength(1);
      expect(results[0].routeId).toBe('route-1');
    });
  });

  describe('updateTripStatus', () => {
    it('should update trip status', async () => {
      const updatedTrip = {
        id: 'trip-1',
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.trip, 'update').mockResolvedValue(updatedTrip);

      const result = await service.updateTripStatus('trip-1', 'IN_PROGRESS');

      expect(result.status).toBe('IN_PROGRESS');
      expect(prismaService.trip.update).toHaveBeenCalled();
    });
  });

  describe('tripExists', () => {
    it('should return true if trip exists', async () => {
      const mockTrip = { id: 'trip-1' };
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(mockTrip);

      const exists = await service.tripExists(
        'route-1',
        'bus-1',
        new Date(),
        new Date(),
      );

      expect(exists).toBe(true);
    });

    it('should return false if trip does not exist', async () => {
      jest.spyOn(prismaService.trip, 'findUnique').mockResolvedValue(null);

      const exists = await service.tripExists(
        'route-1',
        'bus-1',
        new Date(),
        new Date(),
      );

      expect(exists).toBe(false);
    });
  });
});
