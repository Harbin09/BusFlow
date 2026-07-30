export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Stop {
  id: string;
  name: string;
  sequenceOrder: number;
  location: LocationCoordinates;
  estimatedTimeFromStartMinutes: number;
}

export interface Route {
  id: string;
  routeName: string;
  code: string;
  startLocationName: string;
  endLocationName: string;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  stops: Stop[];
  assignedBusCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateRouteDto {
  routeName: string;
  code: string;
  startLocationName: string;
  endLocationName: string;
  stops: Omit<Stop, 'id'>[];
}
