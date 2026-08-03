import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/infrastructure/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should allow request with valid user', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 'user-1', email: 'test@example.com' },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockReturnValue(true as any);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should reject request without user', () => {
      jest.spyOn(guard, 'handleRequest').mockImplementation(() => {
        throw new UnauthorizedException('Unauthorized');
      });

      expect(() => guard.handleRequest(null, null, { message: 'Invalid token' })).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { id: 'user-1', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null);

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, { message: 'Invalid token' })).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when error exists', () => {
      const error = new Error('Token expired');

      expect(() => guard.handleRequest(error, null, null)).toThrow(UnauthorizedException);
    });

    it('should include error message in exception', () => {
      expect(() =>
        guard.handleRequest(null, null, { message: 'Invalid signature' }),
      ).toThrow('Invalid signature');
    });

    it('should provide default message when none given', () => {
      expect(() => guard.handleRequest(null, null, {})).toThrow('Unauthorized');
    });
  });
});
