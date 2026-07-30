'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRole } from '@/lib/services/auth';

export default function RootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Not authenticated - go to login
      router.replace('/login');
      return;
    }

    // Authenticated - route based on role
    if (hasRole('STUDENT')) {
      router.replace('/admin/student');
    } else if (hasRole('DRIVER')) {
      router.replace('/admin/driver');
    } else if (hasRole('ADMIN')) {
      router.replace('/admin');
    } else {
      // Unknown role - go to login
      router.replace('/login');
    }
  }, [router]);

  // Show loading state while routing
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Routing...</p>
      </div>
    </div>
  );
}
