'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { weatherApi } from '@/lib/api';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);

  const navLinks: NavLink[] = [
    {
      label: 'Overview',
      href: '/admin',
      icon: '🏠',
    },
    {
      label: 'Fleet',
      href: '/admin/fleet',
      icon: '🚌',
    },
    {
      label: 'Routes',
      href: '/admin/routes',
      icon: '🗺️',
    },
    {
      label: 'Live Map',
      href: '/admin/tracking',
      icon: '📍',
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: '👨‍🎓',
    },
    {
      label: 'Drivers',
      href: '/admin/drivers',
      icon: '👨‍✈️',
    },
    {
      label: 'Weather & Alerts',
      href: '/admin/alerts',
      icon: '🌧️',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'w-64' : 'w-20'
            } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}
          >
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚌</div>
                {sidebarOpen && (
                  <span className="font-bold text-lg tracking-tight">
                    BusFlow
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    isActive(link.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
                </Link>
              ))}
            </nav>

            {/* Sidebar Toggle */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <span>{sidebarOpen ? '←' : '→'}</span>
                {sidebarOpen && <span className="text-sm">Collapse</span>}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="px-8 py-4 flex items-center justify-between">
                {/* Left Section: Page Title */}
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Command Center
                  </h1>
                </div>

                {/* Right Section: Status, Profile, and Actions */}
                <div className="flex items-center gap-6">
                  {/* System Status Badge */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400"></span>
                    </span>
                    <span className="text-sm font-medium text-green-700">
                      System Operational
                    </span>
                  </div>

                  {/* Simulate Rain Alert Button */}
                  <button
                    disabled={isAlerting}
                    onClick={async () => {
                      setIsAlerting(true);
                      try {
                        const res = await weatherApi.checkWeather();
                        setToastMessage('🌧️ Rain alert simulation triggered! Weather routing adjusted.');
                      } catch {
                        setToastMessage('🌧️ Rain alert simulation triggered (Offline Mode).');
                      } finally {
                        setIsAlerting(false);
                        setTimeout(() => setToastMessage(null), 4000);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {isAlerting ? 'Simulating...' : 'Simulate Rain Alert'}
                  </button>

                  {/* User Profile */}
                  <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      TM
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Transport Manager
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Toast Notification */}
            {toastMessage && (
              <div className="bg-blue-600 text-white px-6 py-3 font-medium text-sm shadow-md flex items-center justify-between animate-fade-in">
                <span>{toastMessage}</span>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-white hover:text-blue-200 text-xs font-bold uppercase ml-4"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-gray-50 p-8">
              {children}
            </main>
          </div>
    </div>
  );
}
