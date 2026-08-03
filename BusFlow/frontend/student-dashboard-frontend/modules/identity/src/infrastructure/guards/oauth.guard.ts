import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      const message = info?.message || 'OAuth authentication failed';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
