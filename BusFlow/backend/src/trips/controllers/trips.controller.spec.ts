import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripGenerationService } from '../services/trip-generation.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TripsController', () => {
  let controller: TripsController;
  let tripGenerationService: TripGenerationService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockTripGenerationService = {
      generateTripsForDate: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripGenerationService,
          useValue: mockTripGenerationService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    tripGenerationService = module.get<TripGenerationService>(
      TripGenerationService,
    );
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('generateTrips', () => {
    it('should generate trips successfully', async () => {
      const mockResults = [
        {
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          departureTime: new Date(),
          approved: true,
          tripId: 'trip-1',
        },
      ];

      jest
        .spyOn(tripGenerationService, 'generateTripsForDate')
        .mockResolvedValue(mockResults);

      const result = await controller.generateTrips({
        date: '2026-07-30',
      });

      expect(result.date).toBe('2026-07-30');
      expect(result.results).toHaveLength(1);
      expect(result.summary.total).toBe(1);
      expect(result.summary.approved).toBe(1);
      expect(result.summary.rejected).toBe(0);
    });

    it('should return summary with mixed results', async () => {
      const mockResults = [
        {
          routeId: 'route-1',
          busId: 'bus-1',
          driverId: 'driver-1',
          departureTime: new Date(),
          approved: true,
          tripId: 'trip-1',
        },
        {
          routeId: 'route-2',
          busId: 'bus-2',
          driverId: 'driver-2',
          departureTime: new Date(),
          approved: false,
          reason: 'Capacity exceeded',
        },
      ];

      jest
        .spyOn(tripGenerationService, 'generateTripsForDate')
        .mockResolvedValue(mockResults);

      const result = await controller.generateTrips({
        date: '2026-07-30',
      });

      expect(result.summary.total).toBe(2);
      expect(result.summary.approved).toBe(1);
      expect(result.summary.rejected).toBe(1);
    });

    it('should handle errors and return 500', async () => {
      jest
        .spyOn(tripGenerationService, 'generateTripsForDate')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.generateTrips({ date: '2026-07-30' }),
      ).rejects.toThrow(HttpException);
    });

    it('should handle empty results', async () => {
      jest
        .spyOn(tripGenerationService, 'generateTripsForDate')
        .mockResolvedValue([]);

      const result = await controller.generateTrips({
        date: '2026-07-30',
      });

      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
      expect(result.summary.approved).toBe(0);
    });
  });
});
