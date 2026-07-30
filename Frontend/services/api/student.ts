import { Student } from '@/types/student';
import { BusLocationUpdate } from '@/types/tracking';

export const studentApi = {
  getProfile: async (): Promise<Student> => {
    return {
      id: 'std-1',
      name: 'Alex Turner',
      email: 'alex@student.univ.edu',
      rollNumber: 'CS-2024-001',
      department: 'Computer Science & Engineering',
      assignedRouteId: 'rt-1',
      assignedRouteName: 'North Campus Express',
      preferredStopId: 'st-2',
      preferredStopName: 'Library Complex',
      passStatus: 'ACTIVE',
      passExpiryDate: '2026-12-31',
      phone: '+1 555-0188',
      createdAt: new Date().toISOString(),
    };
  },

  getTrackedBusLocation: async (busId: string): Promise<BusLocationUpdate> => {
    return {
      busId,
      busNumber: 'BUS-01',
      coordinates: { latitude: 28.6200, longitude: 77.2150 },
      speedKmh: 36,
      headingDegrees: 45,
      currentStopId: 'st-2',
      nextStopId: 'st-3',
      etaNextStopMinutes: 6,
      timestamp: new Date().toISOString(),
    };
  },
};
