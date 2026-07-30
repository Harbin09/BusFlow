import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * AuthController exposes authentication endpoints
 *
 * Routes:
 * - POST /auth/login - Authenticate user with email/password
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate a student or driver with email and password
   * Returns JWT access token
   *
   * @param dto LoginDto with email and password
   * @returns JWT token and authenticated user details
   *
   * Example request body:
   * {
   *   "email": "CTU1001@busflow.com",
   *   "password": "demo-password"
   * }
   *
   * Example response:
   * {
   *   "success": true,
   *   "data": {
   *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {
   *       "id": "clu123xyz",
   *       "email": "CTU1001@busflow.com",
   *       "name": "Ishita Jain",
   *       "role": "STUDENT"
   *     }
   *   }
   * }
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user with email and password',
    description: 'Login endpoint for students and drivers. Returns JWT access token.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials (email and password)',
    examples: {
      student: {
        description: 'Example student login',
        value: {
          email: 'CTU1001@busflow.com',
          password: 'demo-password',
        },
      },
      driver: {
        description: 'Example driver login',
        value: {
          email: 'DRV-001@busflow.com',
          password: 'demo-password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'clu123xyz',
            email: 'CTU1001@busflow.com',
            name: 'Ishita Jain',
            role: 'STUDENT',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    schema: {
      example: {
        success: false,
        error: 'Invalid email or password',
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    this.logger.debug(`[AuthController] POST /auth/login for ${dto.email}`);

    try {
      const result = await this.authService.login(dto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[AuthController] Login failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
