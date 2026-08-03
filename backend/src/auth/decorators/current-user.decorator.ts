import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser decorator extracts the authenticated user from request
 *
 * Usage:
 * async getTodaysTrip(@CurrentUser() user: any) {
 *   const studentId = user.id;
 *   const role = user.role;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
