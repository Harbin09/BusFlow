export interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
}
