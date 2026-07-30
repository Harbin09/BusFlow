export type BusStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ON_TRIP';

export interface Bus {
  id: string;
  busNumber: string;
  licensePlate: string;
  capacity: number;
  currentOccupancy: number;
  status: BusStatus;
  driverId?: string;
  driverName?: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
  fuelLevelPercent?: number;
  speedKmh?: number;
  lastMaintenanceDate?: string;
  createdAt: string;
}

export interface CreateBusDto {
  busNumber: string;
  licensePlate: string;
  capacity: number;
  driverId?: string;
  assignedRouteId?: string;
}
