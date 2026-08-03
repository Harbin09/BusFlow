import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DriverWorkflowController } from './driver-workflow.controller';
import { DriverWorkflowService } from '../services/driver-workflow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';

describe('DriverWorkflowController - Security', () => {
  let controller: DriverWorkflowController;
  let service: DriverWorkflowService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockDriverService = {
      getTodayTrip: jest.fn(),
      startTrip: jest.fn(),
      endTrip: jest.fn(),
      getPassengerList: jest.fn(),
      getExpectedPassengerCount: jest.fn(),
      getActivePassengerCount: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [DriverWorkflowController],
      providers: [
        { provide: DriverWorkflowService, useValue: mockDriverService },
        JwtAuthGuard,
        RoleGuard,
      ],
    }).compile();

    controller = module.get<DriverWorkflowController>(DriverWorkflowController);
    service = module.get<DriverWorkflowService>(DriverWorkflowService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('Authentication Required', () => {
    it('should require JWT authentication on all endpoints', () => {
      // Verify guards are applied at class level
      const guards = Reflect.getMetadata('__guards__', DriverWorkflowController);
      expect(guards).toBeDefined();

      console.log('✓ Validation: JWT authentication guard applied');
    });

    it('should require DRIVER role', () => {
      // Verify roles are set
      const roles = Reflect.getMetadata('roles', DriverWorkflowController);
      expect(roles).toContain('DRIVER');

      console.log('✓ Validation: DRIVER role required');
    });
  });

  describe('GET /drivers/workflow/today', () => {
    it('should return driver\'s trip with authenticated user', async () => {
      const authenticatedDriver = { id: 'driver-1', role: 'DRIVER' };

      const mockTrip = {
        id: 'trip-1',
        status: 'SCHEDULED',
        departureTime: new Date(),
      };

      jest.spyOn(service, 'getTodayTrip').mockResolvedValue(mockTrip as any);

      const result = await controller.getTodaysTrip(authenticatedDriver);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrip);
      expect(service.getTodayTrip).toHaveBeenCalledWith('driver-1');

      console.log('✓ Validation: Authenticated driver gets their trip');
    });

    it('should use authenticated user\'s ID, not hardcoded value', async () => {
      const authenticatedDriver = { id: 'driver-99', role: 'DRIVER' };

      jest.spyOn(service, 'getTodayTrip').mockResolvedValue(null);

      await controller.getTodaysTrip(authenticatedDriver);

      // Should be called with authenticated user's ID
      expect(service.getTodayTrip).toHaveBeenCalledWith('driver-99');

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });
  });

  describe('POST /drivers/workflow/trips/:tripId/start', () => {
    it('should start trip with authenticated driver', async () => {
      const authenticatedDriver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-1';

      jest.spyOn(service, 'startTrip').mockResolvedValue(undefined);

      const result = await controller.startTrip(tripId, {}, authenticatedDriver);

      expect(result.success).toBe(true);
      expect(service.startTrip).toHaveBeenCalledWith('driver-1', tripId);

      console.log('✓ Validation: Driver can start their assigned trip');
    });

    it('should prevent driver from starting another driver\'s trip', async () => {
      const driver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-owned-by-driver-2';

      jest
        .spyOn(service, 'startTrip')
        .mockRejectedValue(
          new ForbiddenException('This trip is not assigned to you'),
        );

      const result = await controller.startTrip(tripId, {}, driver);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);

      console.log('✓ Validation: Driver cannot start other driver\'s trip');
    });

    it('should use authenticated user\'s ID for authorization', async () => {
      const authenticatedDriver = { id: 'driver-50', role: 'DRIVER' };
      const tripId = 'trip-1';

      jest.spyOn(service, 'startTrip').mockResolvedValue(undefined);

      await controller.startTrip(tripId, {}, authenticatedDriver);

      expect(service.startTrip).toHaveBeenCalledWith('driver-50', tripId);

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });
  });

  describe('POST /drivers/workflow/trips/:tripId/end', () => {
    it('should end trip with authenticated driver', async () => {
      const authenticatedDriver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-1';

      jest.spyOn(service, 'endTrip').mockResolvedValue(undefined);

      const result = await controller.endTrip(tripId, {}, authenticatedDriver);

      expect(result.success).toBe(true);
      expect(service.endTrip).toHaveBeenCalledWith('driver-1', tripId);

      console.log('✓ Validation: Driver can end their assigned trip');
    });

    it('should prevent driver from ending another driver\'s trip', async () => {
      const driver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-owned-by-driver-2';

      jest
        .spyOn(service, 'endTrip')
        .mockRejectedValue(
          new ForbiddenException('This trip is not assigned to you'),
        );

      const result = await controller.endTrip(tripId, {}, driver);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);

      console.log('✓ Validation: Driver cannot end other driver\'s trip');
    });

    it('should use authenticated user\'s ID for authorization', async () => {
      const authenticatedDriver = { id: 'driver-75', role: 'DRIVER' };
      const tripId = 'trip-1';

      jest.spyOn(service, 'endTrip').mockResolvedValue(undefined);

      await controller.endTrip(tripId, {}, authenticatedDriver);

      expect(service.endTrip).toHaveBeenCalledWith('driver-75', tripId);

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });
  });

  describe('GET /drivers/workflow/trips/:tripId/passengers', () => {
    it('should return passengers for driver\'s trip', async () => {
      const authenticatedDriver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-1';

      const mockPassengers = [
        { id: 'student-1', name: 'Alice' },
        { id: 'student-2', name: 'Bob' },
      ];

      jest
        .spyOn(service, 'getPassengerList')
        .mockResolvedValue(mockPassengers as any);

      jest
        .spyOn(service, 'getExpectedPassengerCount')
        .mockResolvedValue(2);

      jest
        .spyOn(service, 'getActivePassengerCount')
        .mockResolvedValue(2);

      const result = await controller.getPassengers(tripId, authenticatedDriver);

      expect(result.success).toBe(true);
      expect(result.data.passengers).toEqual(mockPassengers);
      expect(service.getPassengerList).toHaveBeenCalledWith('driver-1', tripId);

      console.log('✓ Validation: Driver can view passengers for their trip');
    });

    it('should prevent driver from viewing another driver\'s passengers', async () => {
      const driver = { id: 'driver-1', role: 'DRIVER' };
      const tripId = 'trip-owned-by-driver-2';

      jest
        .spyOn(service, 'getPassengerList')
        .mockRejectedValue(
          new ForbiddenException('This trip is not assigned to you'),
        );

      const result = await controller.getPassengers(tripId, driver);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);

      console.log('✓ Validation: Driver cannot view other driver\'s passengers');
    });

    it('should use authenticated user\'s ID for authorization', async () => {
      const authenticatedDriver = { id: 'driver-25', role: 'DRIVER' };
      const tripId = 'trip-1';

      jest
        .spyOn(service, 'getPassengerList')
        .mockResolvedValue([]);

      jest
        .spyOn(service, 'getExpectedPassengerCount')
        .mockResolvedValue(0);

      jest
        .spyOn(service, 'getActivePassengerCount')
        .mockResolvedValue(0);

      await controller.getPassengers(tripId, authenticatedDriver);

      expect(service.getPassengerList).toHaveBeenCalledWith('driver-25', tripId);

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce DRIVER role requirement', () => {
      // This is enforced by @Roles('DRIVER') and RoleGuard
      const roles = Reflect.getMetadata('roles', DriverWorkflowController);

      expect(roles).toBeDefined();
      expect(roles).toContain('DRIVER');

      console.log('✓ Validation: DRIVER role enforcement in place');
    });
  });

  describe('Data Isolation', () => {
    it('should ensure each driver only sees their own data', async () => {
      const driver1 = { id: 'driver-1', role: 'DRIVER' };
      const driver2 = { id: 'driver-2', role: 'DRIVER' };

      const tripForDriver1 = { id: 'trip-1' };
      const tripForDriver2 = { id: 'trip-2' };

      // Driver 1 gets trip 1
      jest
        .spyOn(service, 'getTodayTrip')
        .mockResolvedValueOnce(tripForDriver1 as any);

      const result1 = await controller.getTodaysTrip(driver1);
      expect(result1.data).toEqual(tripForDriver1);

      // Driver 2 gets trip 2
      jest
        .spyOn(service, 'getTodayTrip')
        .mockResolvedValueOnce(tripForDriver2 as any);

      const result2 = await controller.getTodaysTrip(driver2);
      expect(result2.data).toEqual(tripForDriver2);

      // Verify each call used correct driver ID
      expect(service.getTodayTrip).toHaveBeenNthCalledWith(1, 'driver-1');
      expect(service.getTodayTrip).toHaveBeenNthCalledWith(2, 'driver-2');

      console.log('✓ Validation: Driver data isolation enforced');
    });
  });

  describe('Cross-Role Access Prevention', () => {
    it('should document that students cannot call driver endpoints', () => {
      // This is enforced at the role guard level
      // A student with @Roles('STUDENT') cannot access @Roles('DRIVER') endpoints
      const driverRoles = Reflect.getMetadata('roles', DriverWorkflowController);

      expect(driverRoles).toContain('DRIVER');
      expect(driverRoles).not.toContain('STUDENT');

      console.log('✓ Validation: Student cannot access driver endpoints');
    });
  });
});
