export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';

export interface Passenger {
  id: string;
  studentId: string;
  studentName: string;
  boardedAtStopName: string;
  boardedAtTime: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  routeId: string;
  routeName: string;
  status: TripStatus;
  startTime: string;
  endTime?: string;
  currentPassengerCount: number;
  maxCapacity: number;
  currentNextStopName?: string;
  delayMinutes?: number;
  createdAt: string;
}
