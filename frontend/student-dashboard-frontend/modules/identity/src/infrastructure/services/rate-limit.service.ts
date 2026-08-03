import { Injectable, TooManyRequestsException } from '@nestjs/common';

interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}

@Injectable()
export class RateLimitService {
  private readonly limits: Map<string, RateLimitRecord> = new Map();

  isAllowed(key: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now();
    const record = this.limits.get(key);

    if (!record || now > record.resetTime) {
      this.limits.set(key, {
        attempts: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (record.attempts >= maxRequests) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
      );
    }

    record.attempts += 1;
    return true;
  }

  reset(key: string): void {
    this.limits.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}
