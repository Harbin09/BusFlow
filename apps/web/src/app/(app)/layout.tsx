'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we are not authenticated and trying to access a protected route
    if (!isAuthenticated && !pathname.includes('/login')) {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Wait until we have decided where to route
  if (!isAuthenticated && !pathname.includes('/login')) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
