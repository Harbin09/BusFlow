import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}
