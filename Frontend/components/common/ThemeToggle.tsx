'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { mode, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
      title="Toggle Theme"
    >
      {mode === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
    </button>
  );
};
