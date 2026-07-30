import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/services/prisma.service';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'test-secret-key-change-in-production';
    console.log('[JwtStrategy] Initializing with secret:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

 async validate(payload: JwtPayload) {
  this.logger.debug('========== JWT STRATEGY.VALIDATE CALLED ==========');
  this.logger.debug('JWT Payload:', JSON.stringify(payload));
  console.log('========== JWT STRATEGY.VALIDATE CALLED ==========');
  console.log('JWT Payload:', payload);

  const user = await this.prismaService.user.findUnique({
    where: { id: payload.id },
  });

  console.log('Database User:', user);

  if (!user) {
    console.log('User NOT found');
    return null;
  }

  console.log('User authenticated');

  return {
    id: payload.id,
    email: payload.email,
    role: user.role,
  };
}
}
