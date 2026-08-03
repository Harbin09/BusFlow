import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../services/rate-limit.service';
import { RATE_LIMIT_KEY, RateLimitConfig } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rateLimitConfig = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(request);
    const endpoint = `${request.method}:${request.path}`;
    const key = `${endpoint}:${clientIp}`;

    this.rateLimitService.isAllowed(key, rateLimitConfig.windowMs, rateLimitConfig.maxRequests);

    return next.handle();
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-client-ip'] ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }
}
