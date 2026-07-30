import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard validates JWT tokens on protected routes
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * async getTodaysTrip(@CurrentUser() user: any) {
 *   // user contains: id, email, role
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`[JwtAuthGuard] Unauthorized: ${info?.message || 'Invalid token'}`);
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    return user;
  }
}
