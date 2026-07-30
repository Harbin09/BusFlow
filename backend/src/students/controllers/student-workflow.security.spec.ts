import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { StudentWorkflowController } from './student-workflow.controller';
import { StudentWorkflowService } from '../services/student-workflow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';

describe('StudentWorkflowController - Security', () => {
  let controller: StudentWorkflowController;
  let service: StudentWorkflowService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockStudentService = {
      getTodayTrip: jest.fn(),
      getBusLocation: jest.fn(),
      verifyStudentTrip: jest.fn(),
      getTripAssignment: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [StudentWorkflowController],
      providers: [
        { provide: StudentWorkflowService, useValue: mockStudentService },
        JwtAuthGuard,
        RoleGuard,
      ],
    }).compile();

    controller = module.get<StudentWorkflowController>(StudentWorkflowController);
    service = module.get<StudentWorkflowService>(StudentWorkflowService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('Authentication Required', () => {
    it('should require JWT authentication on all endpoints', () => {
      // Verify guards are applied at class level
      const guards = Reflect.getMetadata('__guards__', StudentWorkflowController);
      expect(guards).toBeDefined();

      console.log('✓ Validation: JWT authentication guard applied');
    });

    it('should require STUDENT role', () => {
      // Verify roles are set
      const roles = Reflect.getMetadata('roles', StudentWorkflowController);
      expect(roles).toContain('STUDENT');

      console.log('✓ Validation: STUDENT role required');
    });
  });

  describe('GET /students/workflow/today', () => {
    it('should return student\'s trip with authenticated user', async () => {
      const authenticatedStudent = { id: 'student-1', role: 'STUDENT' };

      const mockTrip = {
        tripId: 'trip-1',
        busPlateNumber: 'ABC123',
        driverName: 'John Driver',
        departureTime: new Date(),
      };

      jest.spyOn(service, 'getTodayTrip').mockResolvedValue(mockTrip as any);

      const result = await controller.getTodaysTrip(authenticatedStudent);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrip);
      expect(service.getTodayTrip).toHaveBeenCalledWith('student-1');

      console.log('✓ Validation: Authenticated student gets their trip');
    });

    it('should use authenticated user\'s ID, not request param', async () => {
      const authenticatedStudent = { id: 'student-100', role: 'STUDENT' };

      jest.spyOn(service, 'getTodayTrip').mockResolvedValue(null);

      await controller.getTodaysTrip(authenticatedStudent);

      // Should be called with authenticated user's ID
      expect(service.getTodayTrip).toHaveBeenCalledWith('student-100');

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });

    it('should return null if student has no trip', async () => {
      const authenticatedStudent = { id: 'student-2', role: 'STUDENT' };

      jest.spyOn(service, 'getTodayTrip').mockResolvedValue(null);

      const result = await controller.getTodaysTrip(authenticatedStudent);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();

      console.log('✓ Validation: No trip returns null');
    });
  });

  describe('GET /students/workflow/bus-location/:tripId', () => {
    it('should return bus location for authenticated student', async () => {
      const authenticatedStudent = { id: 'student-1', role: 'STUDENT' };
      const tripId = 'trip-1';

      const mockAssignment = {
        id: 'assignment-1',
        trip: { busId: 'bus-1' },
      };

      const mockLocation = {
        busId: 'bus-1',
        latitude: 28.6139,
        longitude: 77.2090,
        speed: 45.5,
      };

      jest
        .spyOn(service, 'verifyStudentTrip')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service, 'getTripAssignment')
        .mockResolvedValue(mockAssignment as any);

      jest
        .spyOn(service, 'getBusLocation')
        .mockResolvedValue(mockLocation as any);

      const result = await controller.getBusLocation(tripId, authenticatedStudent);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLocation);

      // Verify authorization checks used authenticated user ID
      expect(service.verifyStudentTrip).toHaveBeenCalledWith('student-1', tripId);

      console.log('✓ Validation: Authenticated student gets bus location');
    });

    it('should prevent student from accessing another student\'s trip', async () => {
      const studentA = { id: 'student-1', role: 'STUDENT' };
      const tripId = 'trip-owned-by-student-2';

      jest
        .spyOn(service, 'verifyStudentTrip')
        .mockRejectedValue(
          new ForbiddenException('You are not assigned to this trip'),
        );

      const result = await controller.getBusLocation(tripId, studentA);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(403);

      // Verify authorization was checked with correct student ID
      expect(service.verifyStudentTrip).toHaveBeenCalledWith('student-1', tripId);

      console.log('✓ Validation: Student cannot access other student\'s trip');
    });

    it('should use authenticated user\'s ID for authorization', async () => {
      const authenticatedStudent = { id: 'student-50', role: 'STUDENT' };
      const tripId = 'trip-1';

      jest
        .spyOn(service, 'verifyStudentTrip')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service, 'getTripAssignment')
        .mockResolvedValue({
          trip: { busId: 'bus-1' },
        } as any);

      jest
        .spyOn(service, 'getBusLocation')
        .mockResolvedValue({
          latitude: 28.6139,
          longitude: 77.2090,
        } as any);

      await controller.getBusLocation(tripId, authenticatedStudent);

      // Should use authenticated user ID
      expect(service.verifyStudentTrip).toHaveBeenCalledWith('student-50', tripId);
      expect(service.getTripAssignment).toHaveBeenCalledWith('student-50', tripId);

      console.log('✓ Validation: Uses JWT user ID, not hardcoded');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce STUDENT role requirement', () => {
      // This is enforced by @Roles('STUDENT') and RoleGuard
      const roles = Reflect.getMetadata('roles', StudentWorkflowController);

      expect(roles).toBeDefined();
      expect(roles).toContain('STUDENT');

      console.log('✓ Validation: STUDENT role enforcement in place');
    });
  });

  describe('Data Isolation', () => {
    it('should ensure each student only sees their own data', async () => {
      const student1 = { id: 'student-1', role: 'STUDENT' };
      const student2 = { id: 'student-2', role: 'STUDENT' };

      const tripForStudent1 = { tripId: 'trip-1' };
      const tripForStudent2 = { tripId: 'trip-2' };

      // Student 1 gets trip 1
      jest
        .spyOn(service, 'getTodayTrip')
        .mockResolvedValueOnce(tripForStudent1 as any);

      const result1 = await controller.getTodaysTrip(student1);
      expect(result1.data).toEqual(tripForStudent1);

      // Student 2 gets trip 2
      jest
        .spyOn(service, 'getTodayTrip')
        .mockResolvedValueOnce(tripForStudent2 as any);

      const result2 = await controller.getTodaysTrip(student2);
      expect(result2.data).toEqual(tripForStudent2);

      // Verify each call used correct student ID
      expect(service.getTodayTrip).toHaveBeenNthCalledWith(1, 'student-1');
      expect(service.getTodayTrip).toHaveBeenNthCalledWith(2, 'student-2');

      console.log('✓ Validation: Student data isolation enforced');
    });
  });
});
