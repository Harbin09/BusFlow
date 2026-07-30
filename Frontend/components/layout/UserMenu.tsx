'use client';

import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-2 glass-card border border-slate-800 rounded-xl w-56 space-y-1">
      <div className="px-3 py-2 border-b border-slate-800">
        <p className="text-xs font-bold text-slate-100">{user?.name}</p>
        <p className="text-[10px] text-slate-400">{user?.email}</p>
      </div>
      <button
        onClick={() => logout()}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
};
