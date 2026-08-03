import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from '../src/presentation/controllers/auth.controller';
import { AuthService } from '../src/application/services/auth.service';
import { LoginDto } from '../src/application/dto/login.dto';
import { RegisterDto } from '../src/application/dto/register.dto';
import { AuthResponseDto } from '../src/application/dto/auth-response.dto';
import { UserRole } from '../src/domain/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllTokens: jest.fn(),
    oauthLogin: jest.fn(),
    validateUserById: jest.fn(),
  };

  const mockAuthResponse = new AuthResponseDto(
    'access-token',
    'refresh-token',
    900,
    {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [UserRole.STUDENT],
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
    },
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password@123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
        registerDto.role,
      );
    });

    it('should return status CREATED', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password@123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password@123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token', async () => {
      const user = {
        id: 'user-1',
        tokenVersion: 0,
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshAccessToken(user);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(900);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(
        user.id,
        user.tokenVersion,
      );
    });

    it('should only return accessToken and expiresIn', async () => {
      const user = {
        id: 'user-1',
        tokenVersion: 0,
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshAccessToken(user);

      expect(Object.keys(result)).toEqual(['accessToken', 'expiresIn']);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = { id: 'user-1' };

      mockAuthService.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await controller.logout(user);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith(user.id);
    });
  });

  describe('logoutAll', () => {
    it('should logout user from all devices', async () => {
      const user = { id: 'user-1' };

      mockAuthService.revokeAllTokens.mockResolvedValue(undefined);

      const result = await controller.logoutAll(user);

      expect(result).toEqual({ message: 'Logged out from all devices' });
      expect(mockAuthService.revokeAllTokens).toHaveBeenCalledWith(user.id);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [UserRole.STUDENT],
      };

      const result = await controller.getCurrentUser(user);

      expect(result).toEqual(user);
    });
  });

  describe('getAdminResource', () => {
    it('should return admin resource for admin user', async () => {
      const user = {
        id: 'user-1',
        email: 'admin@example.com',
        roles: [UserRole.ADMIN],
      };

      const result = await controller.getAdminResource(user);

      expect(result).toHaveProperty('message', 'Admin resource');
      expect(result).toHaveProperty('user');
    });
  });

  describe('getStudentResource', () => {
    it('should return student resource for student user', async () => {
      const user = {
        id: 'user-1',
        email: 'student@example.com',
        roles: [UserRole.STUDENT],
      };

      const result = await controller.getStudentResource(user);

      expect(result).toHaveProperty('message', 'Student resource');
      expect(result).toHaveProperty('user');
    });
  });

  describe('getDriverResource', () => {
    it('should return driver resource for driver user', async () => {
      const user = {
        id: 'user-1',
        email: 'driver@example.com',
        roles: [UserRole.DRIVER],
      };

      const result = await controller.getDriverResource(user);

      expect(result).toHaveProperty('message', 'Driver resource');
      expect(result).toHaveProperty('user');
    });
  });

  describe('oauthLogin', () => {
    it('should login with OAuth', async () => {
      const oauthLoginDto = {
        idToken: 'oauth-id-token',
        role: UserRole.STUDENT,
        accessToken: 'oauth-access-token',
      };

      mockAuthService.oauthLogin.mockResolvedValue(mockAuthResponse);

      const result = await controller.oauthLogin(oauthLoginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.oauthLogin).toHaveBeenCalled();
    });

    it('should throw BadRequestException if idToken missing', async () => {
      const oauthLoginDto = {
        idToken: '',
        role: UserRole.STUDENT,
        accessToken: 'oauth-access-token',
      };

      await expect(controller.oauthLogin(oauthLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('googleAuthCallback', () => {
    it('should handle Google OAuth callback', async () => {
      const profile = {
        id: 'google-123',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
        accessToken: 'google-access-token',
        picture: 'https://example.com/pic.jpg',
      };

      mockAuthService.oauthLogin.mockResolvedValue(mockAuthResponse);

      const result = await controller.googleAuthCallback(profile);

      expect(result).toHaveProperty('redirectUrl');
      expect(result.redirectUrl).toContain('oauth-callback');
      expect(mockAuthService.oauthLogin).toHaveBeenCalled();
    });

    it('should throw BadRequestException if profile missing', async () => {
      await expect(controller.googleAuthCallback(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should encode token in redirect URL', async () => {
      const profile = {
        id: 'google-123',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
        accessToken: 'google-access-token',
      };

      mockAuthService.oauthLogin.mockResolvedValue(mockAuthResponse);

      const result = await controller.googleAuthCallback(profile);

      expect(result.redirectUrl).toContain('token=');
      const tokenParam = result.redirectUrl.split('token=')[1];
      expect(tokenParam).toBeDefined();
      const decodedToken = Buffer.from(tokenParam, 'base64').toString('utf-8');
      const parsedToken = JSON.parse(decodedToken);
      expect(parsedToken).toHaveProperty('accessToken');
      expect(parsedToken).toHaveProperty('refreshToken');
    });
  });
});
