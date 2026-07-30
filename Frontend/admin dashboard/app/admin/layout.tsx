'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, logout, getUser, hasRole } from '@/lib/services/auth';

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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Set timestamp client-side only to avoid hydration mismatch
    setLastUpdated(new Date().toLocaleTimeString());

    // Check if user is authenticated (don't check role here - child routes will check)
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    // If accessing any admin page (not driver/student sub-portals), require ADMIN role
    const isStudentPath = pathname.startsWith('/admin/student');
    const isDriverPath = pathname.startsWith('/admin/driver');
    const isAdminPath = pathname.startsWith('/admin') && !isStudentPath && !isDriverPath;

    if (isAdminPath && !hasRole('ADMIN')) {
      router.replace('/login');
      return;
    }

    setUser(getUser());
    setIsLoading(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

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
                    onClick={async () => {
                      try {
                        // This will integrate with the backend weather check endpoint
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/weather/check`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          }
                        );

                        if (response.ok) {
                          alert('Rain alert simulation triggered!');
                        } else {
                          alert('Failed to trigger rain alert');
                        }
                      } catch (error) {
                        console.error('Error triggering rain alert:', error);
                        alert('Error: Could not trigger rain alert');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Simulate Rain Alert
                  </button>

                  {/* User Profile & Logout */}
                  <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-gray-50 p-8">
              {children}
            </main>
          </div>
    </div>
  );
}
