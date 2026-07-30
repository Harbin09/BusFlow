import { Trip } from '@/types/trip';

export const driverApi = {
  getAssignedTrip: async (): Promise<Trip | null> => {
    return {
      id: 'trp-1',
      tripCode: 'TRIP-8821',
      busId: 'bus-1',
      busNumber: 'BUS-01',
      driverId: 'drv-1',
      driverName: 'John Doe',
      routeId: 'rt-1',
      routeName: 'North Campus Express',
      status: 'IN_PROGRESS',
      startTime: new Date(Date.now() - 1200000).toISOString(),
      currentPassengerCount: 32,
      maxCapacity: 50,
      currentNextStopName: 'Engineering Quad',
      createdAt: new Date().toISOString(),
    };
  },

  startTrip: async (tripId: string): Promise<Trip> => {
    const trip = await driverApi.getAssignedTrip();
    return { ...trip!, status: 'IN_PROGRESS', startTime: new Date().toISOString() };
  },

  endTrip: async (tripId: string): Promise<Trip> => {
    const trip = await driverApi.getAssignedTrip();
    return { ...trip!, status: 'COMPLETED', endTime: new Date().toISOString() };
  },

  updatePassengerCount: async (tripId: string, delta: number): Promise<number> => {
    return Math.max(0, 32 + delta);
  },
};
