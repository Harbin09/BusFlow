import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProfile } from '../../domain/interfaces/oauth-profile.interface';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly GOOGLE_OAUTH_VERIFY_URL = 'https://www.googleapis.com/oauth2/v1/tokeninfo';

  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string | undefined,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      await this.verifyGoogleToken(accessToken, profile.id);

      const oauthProfile: OAuthProfile = {
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        picture: profile.photos?.[0]?.value,
        provider: profile.provider,
        accessToken,
        refreshToken,
      };

      done(null, oauthProfile);
    } catch (error) {
      done(error, null);
    }
  }

  private async verifyGoogleToken(accessToken: string, googleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.GOOGLE_OAUTH_VERIFY_URL}?access_token=${accessToken}`);

      if (!response.ok) {
        throw new UnauthorizedException('Google token verification failed');
      }

      const tokenData = await response.json();

      if (tokenData.error) {
        throw new UnauthorizedException(`Google token is invalid: ${tokenData.error_description}`);
      }

      if (!tokenData.user_id || tokenData.user_id !== googleId) {
        throw new UnauthorizedException('Google token user ID mismatch');
      }

      if (tokenData.expires_in <= 0) {
        throw new UnauthorizedException('Google token has expired');
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }
}
