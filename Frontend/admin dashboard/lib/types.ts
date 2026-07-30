/**
 * Shared TypeScript types for BusFlow Admin Dashboard
 */

// ============ Dashboard Types ============

export interface BusStatus {
  id: string;
  routeName: string;
  driverId: string;
  status: 'running' | 'delayed' | 'completed';
  studentsOnBoard: number;
  estimatedArrival: string;
  delayMinutes?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  speed?: number;
  heading?: number;
}

export interface SpecialEvent {
  id: string;
  name: string;
  date: string;
  routesAffected: number;
  icon: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface DashboardSummary {
  activeBuses: number;
  totalStudents: number;
  todaysTrips: number;
  delayedBuses: number;
  weatherStatus: string;
  rsvpCount: number;
  capacity?: number;
  capacityPercentage?: number;
  onTimePercentage?: number;
  busStatuses?: BusStatus[];
  specialEvents?: SpecialEvent[];
}

// ============ Fleet Types ============

export interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  driverId?: string;
  routeId?: string;
  status: 'active' | 'maintenance' | 'inactive';
  purchaseYear?: number;
  lastServiceDate?: string;
  mileage?: number;
  licensePlate?: string;
}

export interface BusList extends PaginatedResponse {
  data: Bus[];
}

// ============ Route Types ============

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequenceNumber: number;
  estimatedStopTime?: number; // in minutes
  address?: string;
}

export interface Route {
  id: string;
  name: string;
  routeCode: string;
  startPoint: Stop;
  endPoint: Stop;
  stops: Stop[];
  totalDistance?: number; // in km
  assignedBusId?: string;
  assignedDriverId?: string;
  schedules?: Schedule[];
  status: 'active' | 'inactive';
}

export interface Schedule {
  id: string;
  routeId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  departureTime: string; // HH:mm format
  arrivalTime: string;
  isHoliday?: boolean;
}

export interface RouteList extends PaginatedResponse {
  data: Route[];
}

// ============ Student Types ============

export interface Student {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  semester: number;
  classesPerWeek: number;
  assignedStops: string[]; // Stop IDs
  preferredRoutes?: string[]; // Route IDs
  status: 'active' | 'inactive';
  rsvpConfirmed?: boolean;
  createdAt?: string;
}

export interface StudentCSV {
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  semester: number;
  classesPerWeek: number;
}

export interface StudentList extends PaginatedResponse {
  data: Student[];
}

// ============ Driver Types ============

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  phoneNumber: string;
  email: string;
  assignedBusId?: string;
  yearsOfExperience: number;
  status: 'active' | 'inactive' | 'on_leave';
  rating?: number; // 1-5 stars
  totalTripsCompleted?: number;
  createdAt?: string;
}

export interface DriverList extends PaginatedResponse {
  data: Driver[];
}

// ============ Weather Types ============

export interface Weather {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  visibility: number; // in km
  icon: string; // emoji or icon code
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  condition: string;
  highTemp: number;
  lowTemp: number;
  precipitationProbability: number;
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'snow' | 'fog' | 'heat' | 'cold';
  severity: 'low' | 'medium' | 'high';
  affectedRoutes: string[];
  estimatedDelayMinutes: number;
  message: string;
  createdAt: string;
}

// ============ Notification Types ============

export interface Notification {
  id: string;
  type: 'broadcast' | 'alert' | 'delay' | 'event';
  title: string;
  message: string;
  recipients: 'all_students' | 'specific_route' | 'specific_bus' | 'specific_driver';
  recipientIds?: string[];
  createdAt: string;
  sentAt?: string;
  readCount?: number;
  totalRecipients?: number;
}

export interface NotificationPayload {
  type: 'broadcast' | 'alert' | 'delay' | 'event';
  title: string;
  message: string;
  recipients: 'all_students' | 'specific_route' | 'specific_bus' | 'specific_driver';
  recipientIds?: string[];
}

// ============ Timetable Types ============

export interface Timetable {
  id: string;
  studentRegistrationNumber: string;
  department: string;
  semester: number;
  section: string;
  monday?: DaySchedule[];
  tuesday?: DaySchedule[];
  wednesday?: DaySchedule[];
  thursday?: DaySchedule[];
  friday?: DaySchedule[];
  saturday?: DaySchedule[];
  sunday?: DaySchedule[];
}

export interface DaySchedule {
  subject: string;
  instructor: string;
  startTime: string; // HH:mm format
  endTime: string;
  room: string;
}

export interface TimetableCSV {
  studentRegistrationNumber: string;
  department: string;
  semester: number;
  section: string;
  dayOfWeek: number; // 0-6
  subject: string;
  instructor: string;
  startTime: string;
  endTime: string;
  room: string;
}

// ============ Analytics Types ============

export interface DailyTrip {
  date: string;
  totalTrips: number;
  completedTrips: number;
  delayedTrips: number;
  cancelledTrips: number;
}

export interface CapacityMetric {
  date: string;
  totalCapacity: number;
  occupiedSeats: number;
  utilizationPercentage: number;
  peakHourCapacity: number;
}

export interface DelayLog {
  id: string;
  busId: string;
  routeId: string;
  delayMinutes: number;
  reason: string;
  timestamp: string;
}

export interface RoutePerformance {
  routeId: string;
  name: string;
  averageDelay: number;
  onTimePercentage: number;
  passengersPerDay: number;
  rating: number;
}

// ============ API Response Types ============

export interface PaginatedResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiPaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ UI Component Types ============

export interface KPICard {
  label: string;
  value: number | string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  unit?: string;
  isText?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface StatusBadgeConfig {
  status: string;
  bg: string;
  text: string;
  icon: string;
}

export interface WidgetCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  bgColor: string;
  hoverColor: string;
  actionText: string;
}

// ============ Form Types ============

export interface CSVUploadResponse {
  success: boolean;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors?: {
    rowNumber: number;
    message: string;
  }[];
}

export interface BroadcastMessagePayload {
  title: string;
  message: string;
  recipients: 'all' | 'route' | 'bus' | 'driver';
  recipientIds?: string[];
  sendImmediately: boolean;
  scheduleTime?: string;
}

// ============ Real-Time Tracking Types ============

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface RealTimeTrackingData {
  busId: string;
  location: GPSLocation;
  speed: number; // km/h
  heading: number; // degrees 0-360
  estimatedArrival: string;
  delayMinutes: number;
  studentsOnBoard: number;
}

export interface TrackingUpdate {
  busId: string;
  tripId?: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading?: number; // degrees 0-360
  status?: string;
  timestamp: string;
  currentStopId?: string;
  nextStopId?: string;
  totalStudentsOnboard?: number;
  lastUpdated?: string;
}

export interface BusTrackingInfo {
  busId: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  delayMinutes: number;
  driverName: string;
  routeName?: string;
  studentsOnBoard?: number;
  lastUpdate: string;
}

export interface TrackingResponse {
  timestamp: string;
  buses: BusTrackingInfo[];
}

// ============ Analytics Types ============

export interface StudentDensity {
  stopId: string;
  stopName: string;
  city: string;
  studentCount: number;
  peakHours: string[]; // e.g., ["08:00-09:00", "14:00-15:00"]
  averageCapacityNeeded: number;
  lastUpdated: string;
  department?: string;
}

export interface StudentDensityResponse {
  timestamp: string;
  data: StudentDensity[];
  summary: {
    totalStudents: number;
    averagePerStop: number;
    peakStop: StudentDensity;
  };
}

export interface RouteSegment {
  sequenceNumber: number;
  stopId: string;
  stopName: string;
  city: string;
  estimatedStopTime: number;
  estimatedPassengers: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RouteSuggestion {
  type: 'rule-based' | 'ai-engine';
  name: string;
  description: string;
  route: RouteSegment[];
  estimatedCapacityUsage: number; // percentage
  estimatedTravelTime: number; // in minutes
  estimatedDelay: number; // in minutes
  efficiency: number; // 0-100 score
  reasoning: string;
  pros: string[];
  cons: string[];
}

export interface RouteDeployPayload {
  selectedSuggestion: 'rule-based' | 'ai-engine';
  routeSegments: RouteSegment[];
  estimatedCapacityUsage: number;
  busId?: string;
  driverId?: string;
  notes?: string;
}

export interface RouteDeployResponse {
  success: boolean;
  routeId: string;
  message: string;
  deployedAt: string;
}

// ============ Temporary Route Types ============

export interface TemporaryStop {
  name: string;
  latitude: number;
  longitude: number;
  sequenceNumber: number;
  estimatedStopTime?: number; // in minutes
  address?: string;
}

export interface TemporaryRoute {
  id: string;
  name: string;
  overrideDate: string; // YYYY-MM-DD
  masterRouteId: string;
  busId: string;
  driverId?: string;
  stops: TemporaryStop[];
  status: 'scheduled' | 'active' | 'completed';
  createdAt?: string;
  notes?: string;
  autoRevertTime?: string; // HH:mm format, default 23:59
}

export interface TemporaryRouteList extends PaginatedResponse {
  data: TemporaryRoute[];
}

// ============ User Types ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'transport_manager' | 'driver' | 'student';
  department?: string;
  contactNumber?: string;
  profileImage?: string;
  createdAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

// ============ Statistics Types ============

export interface SystemStatistics {
  totalBuses: number;
  totalStudents: number;
  totalRoutes: number;
  totalDrivers: number;
  activeBuses: number;
  completedTrips: number;
  pendingTrips: number;
  averageDelay: number;
  systemUptime: number; // percentage
}
