'use client';

import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '../ui/Badge';

export const Header: React.FC<{ title: string }> = ({ title }) => {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between glass-nav sticky top-16 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-200">{user?.name || 'Authorized User'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'Guest'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
