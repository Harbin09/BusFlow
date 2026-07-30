import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * JwtAuthGuard validates JWT tokens on protected routes
 * Skips authentication on routes marked with @Public()
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * async getTodaysTrip(@CurrentUser() user: any) {
 *   // user contains: id, email, role
 * }
 *
 * @Public()
 * @Post('login')
 * async login() {
 *   // No authentication required
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    this.logger.debug(`[JwtAuthGuard] canActivate() called`);
    this.logger.debug(`[JwtAuthGuard] Authorization header: ${authHeader ? 'Present' : 'MISSING'}`);
    this.logger.debug(`[JwtAuthGuard] Full headers: ${JSON.stringify(request.headers)}`);

    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`[JwtAuthGuard] Is route public? ${isPublic}`);

    if (isPublic) {
      this.logger.debug(`[JwtAuthGuard] Route is public, skipping authentication`);
      return true;
    }

    this.logger.debug(`[JwtAuthGuard] Route requires authentication, invoking Passport`);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    this.logger.debug(`[JwtAuthGuard] handleRequest() called`);
    this.logger.debug(`[JwtAuthGuard] Error: ${err ? err.message : 'none'}`);
    this.logger.debug(`[JwtAuthGuard] User: ${user ? JSON.stringify(user) : 'null'}`);
    this.logger.debug(`[JwtAuthGuard] Info: ${info ? info.message : 'none'}`);

    if (err || !user) {
      this.logger.warn(`[JwtAuthGuard] Unauthorized: ${info?.message || 'Invalid token'}`);
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    return user;
  }
}
