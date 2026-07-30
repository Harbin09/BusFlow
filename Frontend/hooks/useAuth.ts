import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, error, login, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    role: user?.role,
    login,
    logout,
  };
}
