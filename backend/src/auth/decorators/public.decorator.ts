import { SetMetadata } from '@nestjs/common';

/**
 * @Public() decorator marks a route as public (no authentication required)
 * Used on routes that should be accessible without a JWT token
 *
 * Usage:
 * @Post('login')
 * @Public()
 * async login(@Body() dto: LoginDto) { }
 */
export const Public = () => SetMetadata('isPublic', true);
