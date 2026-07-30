import { UserRole } from '@/types/auth';

export function canAccessAdmin(role?: UserRole): boolean {
  return role === 'ADMIN';
}

export function canAccessDriverPortal(role?: UserRole): boolean {
  return role === 'DRIVER' || role === 'ADMIN';
}

export function canAccessStudentPortal(role?: UserRole): boolean {
  return role === 'STUDENT' || role === 'ADMIN';
}
