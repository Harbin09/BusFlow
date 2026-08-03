import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../src/application/services/auth.service';
import { TokenService } from '../src/application/services/token.service';
import { IUserRepository } from '../src/application/ports/user.repository.port';
import { User } from '../src/domain/entities/user.entity';
import { UserRole } from '../src/domain/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let userRepository: IUserRepository;
  let configService: ConfigService;

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByRoles: jest.fn(),
    exists: jest.fn(),
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(() => 'mock-access-token'),
    generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    getAccessTokenExpiresIn: jest.fn(() => 900),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: IUserRepository, useValue: mockUserRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const email = 'test@example.com';
      const password = 'Password@123';
      const firstName = 'John';
      const lastName = 'Doe';
      const role = UserRole.STUDENT;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(
        new User('user-1', email, firstName, lastName, [role]),
      );

      const result = await service.register(email, password, firstName, lastName, role);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe(email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const email = 'existing@example.com';
      const existingUser = new User('user-1', email, 'John', 'Doe', [UserRole.STUDENT]);

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.register(email, 'Password@123', 'Jane', 'Doe', UserRole.STUDENT),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password securely', async () => {
      const password = 'Password@123';
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((user: User) => {
        expect(user.passwordHash).toBeDefined();
        expect(user.passwordHash).not.toBe(password);
        expect(user.passwordHash).toContain(':');
        return Promise.resolve(user);
      });

      await service.register('test@example.com', password, 'John', 'Doe', UserRole.STUDENT);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should reject role assignment for non-allowed roles', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.register('test@example.com', 'Password@123', 'John', 'Doe', UserRole.ADMIN),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.register('test@example.com', 'Password@123', 'John', 'Doe', UserRole.DRIVER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should only allow STUDENT role during registration', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(
        new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]),
      );

      const result = await service.register(
        'test@example.com',
        'Password@123',
        'John',
        'Doe',
        UserRole.STUDENT,
      );

      expect(result).toBeDefined();
      expect(result.user.roles).toContain(UserRole.STUDENT);
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password@123';
      const user = new User('user-1', email, 'John', 'Doe', [UserRole.STUDENT]);

      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.login(email, password);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe(email);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login('invalid@example.com', 'Password@123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.isActive = false;

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(service.login('test@example.com', 'Password@123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.passwordHash = undefined;

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(service.login('test@example.com', 'Password@123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.passwordHash = 'hashed-password';

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(service.login('test@example.com', 'WrongPassword@123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update lastLoginAt on successful login', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      const beforeLogin = new Date();

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue(user);

      await service.login('test@example.com', 'Password@123');

      expect(mockUserRepository.update).toHaveBeenCalledWith(expect.any(User));
      const updatedUser = mockUserRepository.update.mock.calls[0][0];
      expect(updatedUser.lastLoginAt).not.toBeUndefined();
      expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('oauthLogin', () => {
    it('should login with OAuth profile', async () => {
      const oauthProfile = {
        id: 'google-123',
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        provider: 'google',
        accessToken: 'oauth-token',
      };

      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(
        new User('user-1', oauthProfile.email, oauthProfile.firstName, oauthProfile.lastName, [
          UserRole.STUDENT,
        ]),
      );
      mockUserRepository.update.mockResolvedValue(
        new User('user-1', oauthProfile.email, oauthProfile.firstName, oauthProfile.lastName, [
          UserRole.STUDENT,
        ]),
      );

      const result = await service.oauthLogin(oauthProfile, UserRole.STUDENT);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(oauthProfile.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should find existing user by google id', async () => {
      const existingUser = new User('user-1', 'existing@example.com', 'John', 'Doe', [
        UserRole.STUDENT,
      ]);
      const oauthProfile = {
        id: 'google-123',
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
        accessToken: 'oauth-token',
      };

      mockUserRepository.findByGoogleId.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(existingUser);

      const result = await service.oauthLogin(oauthProfile, UserRole.STUDENT);

      expect(result).toBeDefined();
      expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith(oauthProfile.id);
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('should reject OAuth role assignment for non-allowed roles', async () => {
      const oauthProfile = {
        id: 'google-123',
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        provider: 'google',
        accessToken: 'oauth-token',
      };

      mockUserRepository.findByGoogleId.mockResolvedValue(null);

      await expect(service.oauthLogin(oauthProfile, UserRole.ADMIN)).rejects.toThrow(
        ForbiddenException,
      );

      await expect(service.oauthLogin(oauthProfile, UserRole.DRIVER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should only allow STUDENT role via OAuth', async () => {
      const oauthProfile = {
        id: 'google-123',
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        provider: 'google',
        accessToken: 'oauth-token',
      };

      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(
        new User('user-1', oauthProfile.email, oauthProfile.firstName, oauthProfile.lastName, [
          UserRole.STUDENT,
        ]),
      );
      mockUserRepository.update.mockResolvedValue(
        new User('user-1', oauthProfile.email, oauthProfile.firstName, oauthProfile.lastName, [
          UserRole.STUDENT,
        ]),
      );

      const result = await service.oauthLogin(oauthProfile, UserRole.STUDENT);

      expect(result).toBeDefined();
      expect(result.user.roles).toContain(UserRole.STUDENT);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.refreshAccessToken('user-1', 0);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.refreshAccessToken('invalid-user', 0)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user inactive', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.isActive = false;

      mockUserRepository.findById.mockResolvedValue(user);

      await expect(service.refreshAccessToken('user-1', 0)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token version mismatch', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.tokenVersion = 1;

      mockUserRepository.findById.mockResolvedValue(user);

      await expect(service.refreshAccessToken('user-1', 0)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should increment token version', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      const initialVersion = user.tokenVersion;

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue(user);

      await service.revokeRefreshToken('user-1');

      expect(mockUserRepository.update).toHaveBeenCalled();
      const updatedUser = mockUserRepository.update.mock.calls[0][0];
      expect(updatedUser.tokenVersion).toBe(initialVersion + 1);
    });
  });

  describe('validateUserById', () => {
    it('should return user if valid', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.validateUserById('user-1');

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.validateUserById('invalid-user')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user inactive', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.isActive = false;

      mockUserRepository.findById.mockResolvedValue(user);

      await expect(service.validateUserById('user-1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
