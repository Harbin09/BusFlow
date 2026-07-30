'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bus, Users, MapPin, GraduationCap, Navigation, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar: React.FC<{ role: 'admin' | 'driver' | 'student' }> = ({ role }) => {
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  const { logout } = useAuth();

  const navItems = {
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Buses Fleet', href: '/admin/buses', icon: Bus },
      { name: 'Drivers', href: '/admin/drivers', icon: Users },
      { name: 'Routes & Stops', href: '/admin/routes', icon: MapPin },
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      { name: 'Active Trips', href: '/admin/trips', icon: Navigation },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
    driver: [
      { name: 'Workstation', href: '/driver/dashboard', icon: LayoutDashboard },
      { name: 'Active Trip', href: '/driver/trip', icon: Navigation },
      { name: 'Passenger Log', href: '/driver/passengers', icon: Users },
    ],
    student: [
      { name: 'My Portal', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Live Bus Tracker', href: '/student/tracking', icon: Navigation },
      { name: 'Profile & Pass', href: '/student/profile', icon: GraduationCap },
    ],
  };

  const items = navItems[role] || [];

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 glass-card border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 p-4">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {role} navigation
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
