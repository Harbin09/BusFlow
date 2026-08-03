// Controllers
export { AuthController } from './presentation/controllers/auth.controller';

// Services
export { AuthService } from './application/services/auth.service';
export { TokenService } from './application/services/token.service';

// Guards
export { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
export { RefreshTokenGuard } from './infrastructure/guards/refresh-token.guard';
export { RolesGuard } from './infrastructure/guards/roles.guard';
export { GoogleOAuthGuard } from './infrastructure/guards/oauth.guard';

// Decorators
export { Roles, ROLES_KEY } from './infrastructure/decorators/roles.decorator';
export { CurrentUser } from './infrastructure/decorators/current-user.decorator';

// DTOs
export { LoginDto } from './application/dto/login.dto';
export { RegisterDto } from './application/dto/register.dto';
export { RefreshTokenDto } from './application/dto/refresh-token.dto';
export { OAuthLoginDto } from './application/dto/oauth-login.dto';
export { AuthResponseDto } from './application/dto/auth-response.dto';

// Entities
export { User } from './domain/entities/user.entity';

// Enums
export { UserRole } from './domain/enums/user-role.enum';

// Interfaces
export { JwtPayload, JwtRefreshPayload } from './domain/interfaces/jwt-payload.interface';
export { UserProfile } from './domain/interfaces/user-profile.interface';
export { OAuthProfile } from './domain/interfaces/oauth-profile.interface';
export { IUserRepository } from './application/ports/user.repository.port';

// Strategies
export { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
export { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
export { GoogleOAuthStrategy } from './infrastructure/strategies/google-oauth.strategy';

// Repository
export { UserRepository } from './infrastructure/repositories/user.repository';

// Module
export { IdentityModule } from './identity.module';
