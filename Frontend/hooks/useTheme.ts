import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

export function useTheme() {
  const { mode, setTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return { mode, setTheme };
}
