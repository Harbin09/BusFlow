import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('JWT Authentication & Authorization', () => {
  let jwtGuard: JwtAuthGuard;
  let roleGuard: RoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    reflector = new Reflector();
    jwtGuard = new JwtAuthGuard();
    roleGuard = new RoleGuard(reflector);
  });

  describe('JwtAuthGuard', () => {
    it('should throw UnauthorizedException if no token provided', () => {
      expect(() => {
        jwtGuard.handleRequest(null, null, { message: 'No token' });
      }).toThrow(UnauthorizedException);

      console.log('✓ Validation: Missing token returns 401');
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      expect(() => {
        jwtGuard.handleRequest(
          new Error('Invalid token'),
          null,
          { message: 'Invalid token' }
        );
      }).toThrow(UnauthorizedException);

      console.log('✓ Validation: Invalid token returns 401');
    });

    it('should return user if token is valid', () => {
      const user = { id: 'user-1', email: 'user@example.com', role: 'STUDENT' };
      const result = jwtGuard.handleRequest(null, user, null);

      expect(result).toEqual(user);

      console.log('✓ Validation: Valid token returns user');
    });
  });

  describe('RoleGuard', () => {
    it('should allow access if user has required role', () => {
      const handler = () => {};
      const mockContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'student-1', role: 'STUDENT' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT']);

      const result = roleGuard.canActivate(mockContext);

      expect(result).toBe(true);

      console.log('✓ Validation: User with correct role allowed');
    });

    it('should deny access if user lacks required role', () => {
      const handler = () => {};
      const mockContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'driver-1', role: 'DRIVER' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT']);

      expect(() => {
        roleGuard.canActivate(mockContext);
      }).toThrow(ForbiddenException);

      console.log('✓ Validation: User with wrong role rejected');
    });

    it('should allow access if no roles specified', () => {
      const handler = () => {};
      const mockContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1', role: 'ANY_ROLE' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(null);

      const result = roleGuard.canActivate(mockContext);

      expect(result).toBe(true);

      console.log('✓ Validation: No roles required allows all');
    });

    it('should allow access if user has any of multiple required roles', () => {
      const handler = () => {};
      const mockContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'admin-1', role: 'ADMIN' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT', 'ADMIN']);

      const result = roleGuard.canActivate(mockContext);

      expect(result).toBe(true);

      console.log('✓ Validation: User matches one of multiple roles');
    });

    it('should throw if no user in request', () => {
      const handler = () => {};
      const mockContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT']);

      expect(() => {
        roleGuard.canActivate(mockContext);
      }).toThrow(ForbiddenException);

      console.log('✓ Validation: Missing user throws error');
    });
  });

  describe('Authorization Scenarios', () => {
    it('should prevent student from accessing driver endpoints', () => {
      const handler = () => {};
      const studentContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'student-1', role: 'STUDENT' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Driver endpoints require DRIVER role
      jest.spyOn(reflector, 'get').mockReturnValue(['DRIVER']);

      expect(() => {
        roleGuard.canActivate(studentContext);
      }).toThrow(ForbiddenException);

      console.log('✓ Validation: Student cannot access driver APIs');
    });

    it('should prevent driver from accessing student endpoints', () => {
      const handler = () => {};
      const driverContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'driver-1', role: 'DRIVER' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Student endpoints require STUDENT role
      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT']);

      expect(() => {
        roleGuard.canActivate(driverContext);
      }).toThrow(ForbiddenException);

      console.log('✓ Validation: Driver cannot access student APIs');
    });

    it('should allow student to access student endpoints', () => {
      const handler = () => {};
      const studentContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'student-1', role: 'STUDENT' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT']);

      const result = roleGuard.canActivate(studentContext);

      expect(result).toBe(true);

      console.log('✓ Validation: Student can access student APIs');
    });

    it('should allow driver to access driver endpoints', () => {
      const handler = () => {};
      const driverContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'driver-1', role: 'DRIVER' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['DRIVER']);

      const result = roleGuard.canActivate(driverContext);

      expect(result).toBe(true);

      console.log('✓ Validation: Driver can access driver APIs');
    });
  });

  describe('Multi-role Scenarios', () => {
    it('should allow admin to access both student and driver endpoints', () => {
      const handler = () => {};
      const adminContext = {
        getHandler: () => handler,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'admin-1', role: 'ADMIN' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Student endpoints
      jest.spyOn(reflector, 'get').mockReturnValue(['STUDENT', 'ADMIN']);
      let result = roleGuard.canActivate(adminContext);
      expect(result).toBe(true);

      // Driver endpoints
      jest.spyOn(reflector, 'get').mockReturnValue(['DRIVER', 'ADMIN']);
      result = roleGuard.canActivate(adminContext);
      expect(result).toBe(true);

      console.log('✓ Validation: Admin can access student and driver endpoints');
    });
  });

  describe('Token Validation', () => {
    it('should have consistent error messages for security', () => {
      const errorMsg = () => {
        try {
          jwtGuard.handleRequest(null, null, { message: 'Invalid token' });
        } catch (error: any) {
          return error.message;
        }
      };

      const msg = errorMsg();
      expect(msg).toContain('Invalid or missing authentication token');

      console.log('✓ Validation: Consistent error messaging');
    });
  });
});
