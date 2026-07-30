import { Test, TestingModule } from '@nestjs/testing';
import { TooManyRequestsException } from '@nestjs/common';
import { RateLimitService } from '../src/infrastructure/services/rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  describe('isAllowed', () => {
    it('should allow first request', () => {
      const result = service.isAllowed('user:login:127.0.0.1', 60000, 5);

      expect(result).toBe(true);
    });

    it('should allow multiple requests within limit', () => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 5;

      for (let i = 0; i < maxRequests; i++) {
        const result = service.isAllowed(key, windowMs, maxRequests);
        expect(result).toBe(true);
      }
    });

    it('should throw TooManyRequestsException when limit exceeded', () => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 3;

      for (let i = 0; i < maxRequests; i++) {
        service.isAllowed(key, windowMs, maxRequests);
      }

      expect(() => service.isAllowed(key, windowMs, maxRequests)).toThrow(
        TooManyRequestsException,
      );
    });

    it('should reset after window expires', (done) => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 100;
      const maxRequests = 1;

      service.isAllowed(key, windowMs, maxRequests);

      expect(() => service.isAllowed(key, windowMs, maxRequests)).toThrow(
        TooManyRequestsException,
      );

      setTimeout(() => {
        const result = service.isAllowed(key, windowMs, maxRequests);
        expect(result).toBe(true);
        done();
      }, windowMs + 10);
    });

    it('should track different keys separately', () => {
      const windowMs = 60000;
      const maxRequests = 1;

      service.isAllowed('user1:login:127.0.0.1', windowMs, maxRequests);
      service.isAllowed('user2:login:127.0.0.1', windowMs, maxRequests);

      expect(() => service.isAllowed('user1:login:127.0.0.1', windowMs, maxRequests)).toThrow();
      const result = service.isAllowed('user2:login:127.0.0.1', windowMs, maxRequests);
      expect(result).toBe(true);
    });

    it('should include reset time in error message', () => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 1;

      service.isAllowed(key, windowMs, maxRequests);

      try {
        service.isAllowed(key, windowMs, maxRequests);
      } catch (error) {
        expect(error.message).toContain('Rate limit exceeded');
        expect(error.message).toContain('seconds');
      }
    });
  });

  describe('reset', () => {
    it('should reset rate limit for key', () => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 1;

      service.isAllowed(key, windowMs, maxRequests);
      expect(() => service.isAllowed(key, windowMs, maxRequests)).toThrow();

      service.reset(key);

      const result = service.isAllowed(key, windowMs, maxRequests);
      expect(result).toBe(true);
    });

    it('should not affect other keys', () => {
      const key1 = 'user1:login:127.0.0.1';
      const key2 = 'user2:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 1;

      service.isAllowed(key1, windowMs, maxRequests);
      service.isAllowed(key2, windowMs, maxRequests);

      service.reset(key1);

      const result1 = service.isAllowed(key1, windowMs, maxRequests);
      expect(result1).toBe(true);

      expect(() => service.isAllowed(key2, windowMs, maxRequests)).toThrow();
    });

    it('should handle non-existent key gracefully', () => {
      expect(() => service.reset('non-existent-key')).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove expired records', (done) => {
      const key1 = 'user1:login:127.0.0.1';
      const key2 = 'user2:login:127.0.0.1';
      const windowMs = 100;
      const maxRequests = 1;

      service.isAllowed(key1, windowMs, maxRequests);

      setTimeout(() => {
        service.isAllowed(key2, windowMs, maxRequests);
        service.cleanup();

        const result = service.isAllowed(key1, windowMs, maxRequests);
        expect(result).toBe(true);

        expect(() => service.isAllowed(key2, windowMs, maxRequests)).toThrow();
        done();
      }, windowMs + 10);
    });

    it('should keep non-expired records', () => {
      const key = 'user:login:127.0.0.1';
      const windowMs = 60000;
      const maxRequests = 1;

      service.isAllowed(key, windowMs, maxRequests);
      service.cleanup();

      expect(() => service.isAllowed(key, windowMs, maxRequests)).toThrow(
        TooManyRequestsException,
      );
    });
  });
});
