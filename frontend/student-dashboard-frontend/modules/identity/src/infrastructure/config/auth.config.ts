import { BadRequestException, registerAs } from '@nestjs/config';

function validateJwtSecret(secret: string | undefined, secretName: string): string {
  if (!secret) {
    throw new BadRequestException(
      `${secretName} is not configured. Set ${secretName.toUpperCase()} environment variable.`,
    );
  }

  if (secret.length < 32) {
    throw new BadRequestException(
      `${secretName} must be at least 32 characters long. Current length: ${secret.length}`,
    );
  }

  if (secret === 'your-secret-key' || secret === 'your-refresh-secret-key') {
    throw new BadRequestException(
      `${secretName} uses default placeholder. Set a strong random secret in production.`,
    );
  }

  return secret;
}

export const authConfig = registerAs('auth', () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  return {
    jwt: {
      secret: validateJwtSecret(jwtSecret, 'JWT_SECRET'),
      refreshSecret: validateJwtSecret(jwtRefreshSecret, 'JWT_REFRESH_SECRET'),
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    rateLimit: {
      login: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
        message: 'Too many login attempts, please try again after 15 minutes',
      },
      register: {
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        message: 'Too many registrations, please try again after 1 hour',
      },
      refresh: {
        windowMs: 60 * 1000,
        maxRequests: 10,
        message: 'Too many refresh attempts, please try again after 1 minute',
      },
    },
  };
});
