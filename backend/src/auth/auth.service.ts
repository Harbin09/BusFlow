import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * AuthService handles authentication logic
 *
 * Responsibilities:
 * - Validate user credentials
 * - Hash and verify passwords
 * - Generate JWT tokens
 * - Return authenticated user info
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticate a user with email and password
   * Returns JWT token and user information
   *
   * @param email User's email address
   * @param password User's password (plain text)
   * @returns JWT token and authenticated user
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug(`[AuthService] Login attempt for ${dto.email}`);

    // Step 1: Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`[AuthService] Login failed: User not found for ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 2: Verify password
    if (!user.password) {
      // If password is not set, reject login
      this.logger.warn(`[AuthService] Login failed: No password set for ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      this.logger.warn(`[AuthService] Login failed: Invalid password for ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 3: Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`[AuthService] ✓ Login successful for ${user.email} (${user.role})`);

    // Step 4: Return token and user info
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Hash a password using bcrypt
   * Used for password updates and resets
   *
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify if a plain text password matches a hash
   * Used in login endpoint
   *
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password from database
   * @returns true if passwords match
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
