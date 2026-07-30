export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  assignedBusId?: string;
  assignedBusNumber?: string;
  rating?: number;
  totalTripsCompleted?: number;
  createdAt: string;
}

export interface CreateDriverDto {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
}
