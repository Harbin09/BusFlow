/**
 * Authentication Service
 *
 * Handles JWT token management and mock authentication.
 *
 * IMPORTANT: This uses mock JWT tokens for development.
 * Once backend implements /auth/login, replace this with real API calls.
 */

export type UserRole = 'ADMIN' | 'DRIVER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthToken {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const TOKEN_STORAGE_KEY = 'bus_flow_auth_token';
const USER_STORAGE_KEY = 'bus_flow_user';

/**
 * Generate a mock JWT token for development
 * TEMPORARY: Replace with real backend token once /auth/login is implemented
 */
function generateMockToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };

  // Mock JWT: header.payload.signature
  // This is not cryptographically secure but works for frontend auth flows
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');

  return `${header}.${body}.${signature}`;
}

/**
 * Mock login - returns different users based on email
 * TEMPORARY: Replace with real backend API call
 */
export async function mockLogin(credentials: LoginCredentials): Promise<AuthToken> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock user database
  const mockUsers: Record<string, User> = {
    'admin@busflow.com': {
      id: 'admin-001',
      email: 'admin@busflow.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
    'driver@busflow.com': {
      id: 'driver-001',
      email: 'driver@busflow.com',
      name: 'John Driver',
      role: 'DRIVER',
    },
    'student@busflow.com': {
      id: 'student-001',
      email: 'student@busflow.com',
      name: 'Alice Student',
      role: 'STUDENT',
    },
  };

  const user = mockUsers[credentials.email];

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // In production, this would verify the password against the backend
  if (credentials.password !== 'password') {
    throw new Error('Invalid email or password');
  }

  const token = generateMockToken(user);

  return {
    access_token: token,
    user,
  };
}

/**
 * Login with email and password
 *
 * IMPORTANT: Currently uses mock authentication.
 * TODO: Replace with real backend /auth/login endpoint once available.
 *
 * @param email User email
 * @param password User password
 * @returns Authentication token and user info
 */
export async function login(email: string, password: string): Promise<AuthToken> {
  try {
    // TODO: Replace with real backend call:
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // const data = await response.json();
    // return data;

    // Use mock for now
    const result = await mockLogin({ email, password });

    // Store token and user
    setToken(result.access_token);
    setUser(result.user);

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

/**
 * Logout - clears stored token and user
 */
export function logout(): void {
  clearToken();
  clearUser();
}

/**
 * Store JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Retrieve stored JWT token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    const devUser: User = {
      id: 'admin-001',
      email: 'admin@busflow.com',
      name: 'Admin User',
      role: 'ADMIN',
    };
    token = generateMockToken(devUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(devUser));
  }
  return token;
}

/**
 * Clear stored JWT token
 */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * Store current user in localStorage
 */
export function setUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Retrieve current user from localStorage
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) {
    const devUser: User = {
      id: 'admin-001',
      email: 'admin@busflow.com',
      name: 'Admin User',
      role: 'ADMIN',
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(devUser));
    return devUser;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored user
 */
export function clearUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Check if token is valid (not expired)
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode the JWT payload (middle part)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * Get current user's role
 */
export function getUserRole(): UserRole | null {
  const user = getUser();
  return user?.role || null;
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  return getUserRole() === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: UserRole[]): boolean {
  const userRole = getUserRole();
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return isTokenValid() && getUser() !== null;
}
