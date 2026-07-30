import { BusLocationUpdate, GeofenceAlert } from '@/types/tracking';

export const trackingApi = {
  getAllActiveLocations: async (): Promise<BusLocationUpdate[]> => {
    return [
      {
        busId: 'bus-1',
        busNumber: 'BUS-01',
        tripId: 'trp-1',
        routeId: 'rt-1',
        coordinates: { latitude: 28.6200, longitude: 77.2150 },
        speedKmh: 38,
        headingDegrees: 90,
        currentStopId: 'st-2',
        nextStopId: 'st-3',
        etaNextStopMinutes: 5,
        timestamp: new Date().toISOString(),
      },
      {
        busId: 'bus-2',
        busNumber: 'BUS-02',
        tripId: 'trp-2',
        routeId: 'rt-2',
        coordinates: { latitude: 28.6100, longitude: 77.2050 },
        speedKmh: 42,
        headingDegrees: 180,
        currentStopId: 'st-10',
        nextStopId: 'st-11',
        etaNextStopMinutes: 3,
        timestamp: new Date().toISOString(),
      },
    ];
  },

  getRecentAlerts: async (): Promise<GeofenceAlert[]> => {
    return [
      {
        id: 'alt-1',
        busId: 'bus-1',
        busNumber: 'BUS-01',
        alertType: 'STOP_ARRIVED',
        message: 'BUS-01 arrived at Library Complex stop',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'alt-2',
        busId: 'bus-2',
        busNumber: 'BUS-02',
        alertType: 'SPEEDING',
        message: 'BUS-02 exceeded speed limit (52 km/h in 40 zone)',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ];
  },
};
