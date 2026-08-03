import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtRefreshPayload } from '../../domain/interfaces/jwt-payload.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '15m',
    });
  }

  generateRefreshToken(user: User): string {
    const payload: JwtRefreshPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    });
  }

  getAccessTokenExpiresIn(): number {
    return 15 * 60;
  }
}
