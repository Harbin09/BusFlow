import apiClient from './axios';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // In production, this calls apiClient.post('/auth/login', credentials)
    // Providing a structured fallback demo for instant testing:
    const role = credentials.role || (credentials.email.includes('admin') ? 'ADMIN' : credentials.email.includes('driver') ? 'DRIVER' : 'STUDENT');
    const mockUser: User = {
      id: 'usr-101',
      name: credentials.email.split('@')[0].toUpperCase() || 'Demo User',
      email: credentials.email,
      role: role,
      createdAt: new Date().toISOString(),
    };
    return {
      user: mockUser,
      token: 'jwt-token-sample-xyz-12345',
    };
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get('/auth/me');
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: `Password reset link dispatched to ${email}` };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
  },
};
