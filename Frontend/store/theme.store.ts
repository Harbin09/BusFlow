import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'dark',
  setTheme: (mode) => {
    set({ mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_mode', mode);
    }
  },
}));
