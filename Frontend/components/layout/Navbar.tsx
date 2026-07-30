'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Shield, User, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
            <Bus className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-slate-100 tracking-tight">
            Bus<span className="text-blue-500">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <Link href={`/${user.role.toLowerCase()}/dashboard`}>
              <Button variant="secondary" size="sm" leftIcon={<Shield className="w-4 h-4 text-blue-400" />}>
                {user.role} Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                Portal Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
