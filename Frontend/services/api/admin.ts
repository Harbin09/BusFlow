import { Bus, CreateBusDto } from '@/types/bus';
import { Driver, CreateDriverDto } from '@/types/driver';
import { Route, CreateRouteDto } from '@/types/route';
import { Student } from '@/types/student';
import { Trip } from '@/types/trip';

export const adminApi = {
  getBuses: async (): Promise<Bus[]> => {
    return [
      { id: 'bus-1', busNumber: 'BUS-01', licensePlate: 'DL-01-AB-1234', capacity: 50, currentOccupancy: 32, status: 'ON_TRIP', driverName: 'John Doe', assignedRouteName: 'North Campus Express', fuelLevelPercent: 82, speedKmh: 38, createdAt: new Date().toISOString() },
      { id: 'bus-2', busNumber: 'BUS-02', licensePlate: 'DL-01-AB-5678', capacity: 40, currentOccupancy: 15, status: 'ON_TRIP', driverName: 'Robert Smith', assignedRouteName: 'South Hostel Shuttle', fuelLevelPercent: 64, speedKmh: 42, createdAt: new Date().toISOString() },
      { id: 'bus-3', busNumber: 'BUS-03', licensePlate: 'DL-01-AB-9012', capacity: 55, currentOccupancy: 0, status: 'ACTIVE', driverName: 'Alice Johnson', assignedRouteName: 'East Gate Loop', fuelLevelPercent: 95, speedKmh: 0, createdAt: new Date().toISOString() },
      { id: 'bus-4', busNumber: 'BUS-04', licensePlate: 'DL-01-AB-3456', capacity: 45, currentOccupancy: 0, status: 'MAINTENANCE', fuelLevelPercent: 40, speedKmh: 0, createdAt: new Date().toISOString() },
    ];
  },

  createBus: async (dto: CreateBusDto): Promise<Bus> => {
    return {
      id: `bus-${Date.now()}`,
      ...dto,
      currentOccupancy: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  },

  getDrivers: async (): Promise<Driver[]> => {
    return [
      { id: 'drv-1', name: 'John Doe', email: 'john@campusbus.com', phone: '+1 555-0192', licenseNumber: 'DL-998877', status: 'ON_DUTY', assignedBusNumber: 'BUS-01', rating: 4.8, totalTripsCompleted: 142, createdAt: new Date().toISOString() },
      { id: 'drv-2', name: 'Robert Smith', email: 'robert@campusbus.com', phone: '+1 555-0193', licenseNumber: 'DL-443322', status: 'ON_DUTY', assignedBusNumber: 'BUS-02', rating: 4.9, totalTripsCompleted: 210, createdAt: new Date().toISOString() },
      { id: 'drv-3', name: 'Alice Johnson', email: 'alice@campusbus.com', phone: '+1 555-0194', licenseNumber: 'DL-112233', status: 'AVAILABLE', assignedBusNumber: 'BUS-03', rating: 4.7, totalTripsCompleted: 88, createdAt: new Date().toISOString() },
    ];
  },

  createDriver: async (dto: CreateDriverDto): Promise<Driver> => {
    return {
      id: `drv-${Date.now()}`,
      ...dto,
      status: 'AVAILABLE',
      rating: 5.0,
      totalTripsCompleted: 0,
      createdAt: new Date().toISOString(),
    };
  },

  getRoutes: async (): Promise<Route[]> => {
    return [
      {
        id: 'rt-1',
        routeName: 'North Campus Express',
        code: 'NCE-01',
        startLocationName: 'Main Gate Terminal',
        endLocationName: 'Science Block',
        totalDistanceKm: 12.4,
        estimatedDurationMinutes: 35,
        status: 'ACTIVE',
        assignedBusCount: 3,
        stops: [
          { id: 'st-1', name: 'Main Gate Terminal', sequenceOrder: 1, location: { latitude: 28.6139, longitude: 77.2090 }, estimatedTimeFromStartMinutes: 0 },
          { id: 'st-2', name: 'Library Complex', sequenceOrder: 2, location: { latitude: 28.6200, longitude: 77.2150 }, estimatedTimeFromStartMinutes: 10 },
          { id: 'st-3', name: 'Engineering Quad', sequenceOrder: 3, location: { latitude: 28.6280, longitude: 77.2200 }, estimatedTimeFromStartMinutes: 22 },
          { id: 'st-4', name: 'Science Block', sequenceOrder: 4, location: { latitude: 28.6350, longitude: 77.2280 }, estimatedTimeFromStartMinutes: 35 },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  },

  createRoute: async (dto: CreateRouteDto): Promise<Route> => {
    return {
      id: `rt-${Date.now()}`,
      routeName: dto.routeName,
      code: dto.code,
      startLocationName: dto.startLocationName,
      endLocationName: dto.endLocationName,
      totalDistanceKm: 10,
      estimatedDurationMinutes: 30,
      status: 'ACTIVE',
      stops: dto.stops.map((s, idx) => ({ ...s, id: `st-${idx + 1}` })),
      createdAt: new Date().toISOString(),
    };
  },

  getStudents: async (): Promise<Student[]> => {
    return [
      { id: 'std-1', name: 'Alex Turner', email: 'alex@student.univ.edu', rollNumber: 'CS-2024-001', department: 'Computer Science', assignedRouteName: 'North Campus Express', preferredStopName: 'Library Complex', passStatus: 'ACTIVE', createdAt: new Date().toISOString() },
      { id: 'std-2', name: 'Sarah Jenkins', email: 'sarah@student.univ.edu', rollNumber: 'EE-2024-042', department: 'Electrical Engineering', assignedRouteName: 'South Hostel Shuttle', preferredStopName: 'Hostel Block B', passStatus: 'ACTIVE', createdAt: new Date().toISOString() },
    ];
  },

  getTrips: async (): Promise<Trip[]> => {
    return [
      { id: 'trp-1', tripCode: 'TRIP-8821', busId: 'bus-1', busNumber: 'BUS-01', driverId: 'drv-1', driverName: 'John Doe', routeId: 'rt-1', routeName: 'North Campus Express', status: 'IN_PROGRESS', startTime: new Date(Date.now() - 1200000).toISOString(), currentPassengerCount: 32, maxCapacity: 50, currentNextStopName: 'Engineering Quad', createdAt: new Date().toISOString() },
    ];
  },
};
