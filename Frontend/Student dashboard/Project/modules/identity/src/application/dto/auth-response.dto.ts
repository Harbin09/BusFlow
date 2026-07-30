import { UserProfile } from '../../domain/interfaces/user-profile.interface';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;

  constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: UserProfile,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.user = user;
  }
}
