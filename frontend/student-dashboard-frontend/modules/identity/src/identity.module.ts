import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { TokenService } from './application/services/token.service';

import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { GoogleOAuthStrategy } from './infrastructure/strategies/google-oauth.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RefreshTokenGuard } from './infrastructure/guards/refresh-token.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { GoogleOAuthGuard } from './infrastructure/guards/oauth.guard';

import { UserRepository } from './infrastructure/repositories/user.repository';
import { IUserRepository } from './application/ports/user.repository.port';

import { RateLimitService } from './infrastructure/services/rate-limit.service';
import { RateLimitInterceptor } from './infrastructure/interceptors/rate-limit.interceptor';

import { authConfig } from './infrastructure/config/auth.config';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwt.secret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOAuthStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
    RolesGuard,
    GoogleOAuthGuard,
    RateLimitService,
    RateLimitInterceptor,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    RefreshTokenGuard,
    RolesGuard,
    GoogleOAuthGuard,
    RateLimitService,
    IUserRepository,
  ],
})
export class IdentityModule {}
