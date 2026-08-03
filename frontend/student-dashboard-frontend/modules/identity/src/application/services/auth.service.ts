import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../ports/user.repository.port';
import { TokenService } from './token.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserProfile } from '../../domain/interfaces/user-profile.interface';
import { OAuthProfile } from '../../domain/interfaces/oauth-profile.interface';
import { UserRole } from '../../domain/enums/user-role.enum';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  private readonly ALLOWED_REGISTRATION_ROLES = [UserRole.STUDENT];
  private readonly OAUTH_ALLOWED_ROLES = [UserRole.STUDENT];

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<AuthResponseDto> {
    if (!this.ALLOWED_REGISTRATION_ROLES.includes(role)) {
      throw new ForbiddenException(
        `Role ${role} cannot be self-assigned during registration. Allowed roles: ${this.ALLOWED_REGISTRATION_ROLES.join(', ')}`,
      );
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = new User(uuidv4(), email, firstName, lastName, [role]);
    user.passwordHash = await this.hashPasswordAsync(password);
    user.isEmailVerified = false;

    const createdUser = await this.userRepository.create(user);
    return this.generateAuthResponse(createdUser);
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('User has not set a password. Use OAuth instead.');
    }

    const isPasswordValid = await this.verifyPasswordAsync(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.update(user);

    return this.generateAuthResponse(user);
  }

  async validateOAuthProfile(profile: OAuthProfile): Promise<User> {
    let user = await this.userRepository.findByEmail(profile.email);

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        user = await this.userRepository.update(user);
      }
      user.lastLoginAt = new Date();
      return this.userRepository.update(user);
    }

    user = new User(uuidv4(), profile.email, profile.firstName, profile.lastName, [UserRole.STUDENT]);
    user.googleId = profile.id;
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();

    return this.userRepository.create(user);
  }

  async oauthLogin(profile: OAuthProfile, requestedRole: UserRole): Promise<AuthResponseDto> {
    if (!this.OAUTH_ALLOWED_ROLES.includes(requestedRole)) {
      throw new ForbiddenException(
        `Role ${requestedRole} cannot be assigned via OAuth. Allowed roles: ${this.OAUTH_ALLOWED_ROLES.join(', ')}`,
      );
    }

    let user = await this.userRepository.findByGoogleId(profile.id);

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);
      if (!user) {
        user = new User(uuidv4(), profile.email, profile.firstName, profile.lastName, [requestedRole]);
        user.googleId = profile.id;
        user.isEmailVerified = true;
      } else {
        if (!user.googleId) {
          user.googleId = profile.id;
        }
        if (!user.roles.includes(requestedRole)) {
          user.roles.push(requestedRole);
        }
      }
    }

    user.lastLoginAt = new Date();
    const savedUser = await this.userRepository.update(user);

    return this.generateAuthResponse(savedUser);
  }

  async refreshAccessToken(userId: string, tokenVersion: number): Promise<AuthResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (user.tokenVersion !== tokenVersion) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked');
    }

    return this.generateAuthResponse(user);
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.incrementTokenVersion();
      await this.userRepository.update(user);
    }
  }

  async revokeAllTokens(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.incrementTokenVersion();
      await this.userRepository.update(user);
    }
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    const expiresIn = this.tokenService.getAccessTokenExpiresIn();

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    return new AuthResponseDto(accessToken, refreshToken, expiresIn, userProfile);
  }

  private async hashPasswordAsync(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${hash.toString('hex')}`;
  }

  private async verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
    try {
      const [salt, key] = hash.split(':');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
      return timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }
}
