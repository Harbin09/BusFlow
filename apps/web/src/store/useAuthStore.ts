import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    role: 'STUDENT' | 'DRIVER' | 'ADMIN';
    name: string;
  } | null;
  login: (id: string, role: 'STUDENT' | 'DRIVER' | 'ADMIN', name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Temporarily set to true with hardcoded user until JWT is fixed on backend
  isAuthenticated: true,
  user: {
    id: 'student-1',
    role: 'STUDENT',
    name: 'Test Student',
  },
  login: (id, role, name) => set({ isAuthenticated: true, user: { id, role, name } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
