import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator specifies which roles are allowed on an endpoint
 *
 * Usage:
 * @Roles('STUDENT')
 * @UseGuards(RoleGuard)
 * async getTodaysTrip() {
 *   // Only STUDENT role allowed
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
