import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleOAuthStrategy } from '../src/infrastructure/strategies/google-oauth.strategy';

describe('GoogleOAuthStrategy', () => {
  let strategy: GoogleOAuthStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleOAuthStrategy],
    }).compile();

    strategy = module.get<GoogleOAuthStrategy>(GoogleOAuthStrategy);
  });

  describe('validate', () => {
    it('should validate and return oauth profile with valid token', async () => {
      const accessToken = 'valid-google-token';
      const refreshToken = 'refresh-token';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user_id: 'google-123',
          expires_in: 3600,
        }),
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, refreshToken, profile, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        id: 'google-123',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
        accessToken,
        refreshToken,
      }));
    });

    it('should reject invalid token', async () => {
      const accessToken = 'invalid-token';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      expect(done).toHaveBeenCalledWith(expect.any(Error), null);
    });

    it('should reject token with user_id mismatch', async () => {
      const accessToken = 'token-mismatch';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user_id: 'different-google-id',
          expires_in: 3600,
        }),
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
    });

    it('should reject expired token', async () => {
      const accessToken = 'expired-token';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user_id: 'google-123',
          expires_in: -1,
        }),
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
    });

    it('should handle google error response', async () => {
      const accessToken = 'error-token';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          error: 'invalid_token',
          error_description: 'Token is invalid or expired',
        }),
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
    });

    it('should handle fetch network errors', async () => {
      const accessToken = 'network-error-token';
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        name: { givenName: 'John', familyName: 'Doe' },
        provider: 'google',
      };

      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
    });

    it('should extract profile data correctly', async () => {
      const accessToken = 'valid-token';
      const profile = {
        id: 'google-456',
        emails: [{ value: 'jane@example.com' }],
        name: { givenName: 'Jane', familyName: 'Smith' },
        photos: [{ value: 'https://example.com/jane.jpg' }],
        provider: 'google',
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user_id: 'google-456',
          expires_in: 3600,
        }),
      });

      global.fetch = mockFetch;

      const done = jest.fn();

      await strategy.validate(accessToken, undefined, profile, done);

      const profileArg = done.mock.calls[0][1];
      expect(profileArg.id).toBe('google-456');
      expect(profileArg.email).toBe('jane@example.com');
      expect(profileArg.firstName).toBe('Jane');
      expect(profileArg.lastName).toBe('Smith');
      expect(profileArg.picture).toBe('https://example.com/jane.jpg');
    });
  });
});
