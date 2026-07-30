export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
  preferredStopId?: string;
  preferredStopName?: string;
  passStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  passExpiryDate?: string;
  phone?: string;
  createdAt: string;
}
