/**
 * AuthResponseDto returned from POST /auth/login
 * Contains JWT token and authenticated user information
 */
export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
