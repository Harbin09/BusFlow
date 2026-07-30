import { LocationCoordinates } from './route';

export interface BusLocationUpdate {
  busId: string;
  busNumber: string;
  tripId?: string;
  routeId?: string;
  coordinates: LocationCoordinates;
  speedKmh: number;
  headingDegrees: number;
  currentStopId?: string;
  nextStopId?: string;
  etaNextStopMinutes?: number;
  timestamp: string;
}

export interface GeofenceAlert {
  id: string;
  busId: string;
  busNumber: string;
  alertType: 'STOP_ARRIVED' | 'STOP_DEPARTED' | 'ROUTE_DEVIATION' | 'SPEEDING';
  message: string;
  timestamp: string;
}
