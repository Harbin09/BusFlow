import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { OAuthLoginDto } from '../../application/dto/oauth-login.dto';
import { AuthResponseDto } from '../../application/dto/auth-response.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../../infrastructure/guards/refresh-token.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { GoogleOAuthGuard } from '../../infrastructure/guards/oauth.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { RateLimit } from '../../infrastructure/decorators/rate-limit.decorator';
import { RateLimitInterceptor } from '../../infrastructure/interceptors/rate-limit.interceptor';
import { UserRole } from '../../domain/enums/user-role.enum';

@Controller('auth')
@UseInterceptors(RateLimitInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3 })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.role,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 60 * 1000, maxRequests: 10 })
  async refreshAccessToken(
    @CurrentUser() user: any,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const authResponse = await this.authService.refreshAccessToken(
      user.id,
      user.tokenVersion,
    );
    return {
      accessToken: authResponse.accessToken,
      expiresIn: authResponse.expiresIn,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any): Promise<{ message: string }> {
    await this.authService.revokeRefreshToken(user.id);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: any): Promise<{ message: string }> {
    await this.authService.revokeAllTokens(user.id);
    return { message: 'Logged out from all devices' };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @CurrentUser() profile: any,
  ): Promise<{ redirectUrl: string }> {
    if (!profile) {
      throw new BadRequestException('OAuth profile not found');
    }

    const defaultRole = UserRole.STUDENT;
    const oauthProfile = {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      provider: profile.provider,
      accessToken: profile.accessToken,
      picture: profile.picture,
      refreshToken: profile.refreshToken,
    };

    const authResponse = await this.authService.oauthLogin(oauthProfile, defaultRole);

    const encodedToken = Buffer.from(JSON.stringify(authResponse)).toString('base64');
    return {
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/oauth-callback?token=${encodedToken}`,
    };
  }

  @Post('oauth/login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })
  async oauthLogin(@Body() oauthLoginDto: OAuthLoginDto): Promise<AuthResponseDto> {
    if (!oauthLoginDto.idToken) {
      throw new BadRequestException('ID token is required');
    }

    const oauthProfile = {
      id: oauthLoginDto.idToken,
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name',
      provider: 'google',
      accessToken: oauthLoginDto.accessToken || '',
      picture: undefined,
      refreshToken: undefined,
    };

    return this.authService.oauthLogin(oauthProfile, oauthLoginDto.role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any): Promise<any> {
    return user;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminResource(@CurrentUser() user: any): Promise<any> {
    return { message: 'Admin resource', user };
  }

  @Get('student-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentResource(@CurrentUser() user: any): Promise<any> {
    return { message: 'Student resource', user };
  }

  @Get('driver-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async getDriverResource(@CurrentUser() user: any): Promise<any> {
    return { message: 'Driver resource', user };
  }
}
