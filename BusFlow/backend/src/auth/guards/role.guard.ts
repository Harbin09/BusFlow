import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RoleGuard enforces role-based access control
 *
 * Usage:
 * @SetMetadata('roles', ['STUDENT'])
 * @UseGuards(RoleGuard)
 * async getTodaysTrip() {
 *   // Only STUDENT role allowed
 * }
 */
@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('[RoleGuard] No user in request');
      throw new ForbiddenException('No user in request');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      this.logger.warn(
        `[RoleGuard] User ${user.id} with role ${user.role} not allowed. Required: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `This endpoint requires one of these roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
