import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RateLimit = (config: RateLimitConfig) => SetMetadata(RATE_LIMIT_KEY, config);
