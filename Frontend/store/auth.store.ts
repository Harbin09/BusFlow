import { create } from 'zustand';
import { User, LoginCredentials } from '@/types/auth';
import { authApi } from '@/services/api/auth';
import { tokenStorage } from '@/services/storage/token';
import { userStorage } from '@/services/storage/user';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initializeAuth: () => {
    const storedToken = tokenStorage.getToken();
    const storedUser = userStorage.getUser();
    if (storedToken && storedUser) {
      set({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
      });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      tokenStorage.setToken(response.token);
      userStorage.setUser(response.user);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      tokenStorage.removeToken();
      userStorage.removeUser();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
