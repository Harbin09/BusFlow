import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../src/application/services/token.service';
import { User } from '../src/domain/entities/user.entity';
import { UserRole } from '../src/domain/enums/user-role.enum';
import { JwtPayload } from '../src/domain/interfaces/jwt-payload.interface';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn((payload: any, options: any) => {
      if (options.expiresIn === '15m') {
        return 'mock-access-token';
      } else if (options.expiresIn === '7d') {
        return 'mock-refresh-token';
      }
      return 'mock-token';
    }),
    verify: jest.fn((token: string, options: any) => {
      if (token === 'mock-access-token') {
        return {
          sub: 'user-1',
          email: 'test@example.com',
          roles: [UserRole.STUDENT],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 15 * 60,
        } as JwtPayload;
      } else if (token === 'mock-refresh-token') {
        return {
          sub: 'user-1',
          tokenVersion: 0,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        };
      }
      throw new Error('Invalid token');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      const token = service.generateAccessToken(user);

      expect(token).toBe('mock-access-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          roles: user.roles,
        }),
        expect.objectContaining({
          secret: expect.any(String),
          expiresIn: '15m',
        }),
      );
    });

    it('should include user roles in token', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      const token = service.generateAccessToken(user);

      expect(token).toBeDefined();
      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs.roles).toContain(UserRole.ADMIN);
      expect(callArgs.roles).toContain(UserRole.DRIVER);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      const token = service.generateRefreshToken(user);

      expect(token).toBe('mock-refresh-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          tokenVersion: user.tokenVersion,
        }),
        expect.objectContaining({
          secret: expect.any(String),
          expiresIn: '7d',
        }),
      );
    });

    it('should include token version in refresh token', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.tokenVersion = 3;

      service.generateRefreshToken(user);

      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs.tokenVersion).toBe(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return access token payload', () => {
      const payload = service.verifyAccessToken('mock-access-token');

      expect(payload).toBeDefined();
      expect(payload.sub).toBe('user-1');
      expect(payload.email).toBe('test@example.com');
      expect(payload.roles).toContain(UserRole.STUDENT);
    });

    it('should throw error for invalid token', () => {
      expect(() => service.verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and return refresh token payload', () => {
      const payload = service.verifyRefreshToken('mock-refresh-token');

      expect(payload).toBeDefined();
      expect(payload.sub).toBe('user-1');
      expect(payload.tokenVersion).toBe(0);
    });

    it('should throw error for invalid token', () => {
      expect(() => service.verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('getAccessTokenExpiresIn', () => {
    it('should return access token expiration in seconds', () => {
      const expiresIn = service.getAccessTokenExpiresIn();

      expect(expiresIn).toBe(15 * 60);
      expect(expiresIn).toBe(900);
    });
  });
});
