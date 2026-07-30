// Bus-related types (matches backend response)
export interface Bus {
  id?: string;
  busNumber: string;
  plateNumber: string;
  status: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  capacity: number;
  eta: number; // in seconds
  etaTime?: string; // time string like "8:30 AM"
  routeName?: string; // For available buses endpoint
  driverName?: string; // For available buses endpoint
}

// Route-related types
export interface Route {
  id: string;
  routeName: string;
  routeNumber?: string;
  startPoint?: string;
  endPoint?: string;
  stops?: Stop[];
  totalDistance?: number;
  estimatedDuration?: number; // in minutes
}

// Stop types (matches backend pickup/dropping stops)
export interface Stop {
  id: string;
  stopName: string;
  latitude?: number;
  longitude?: number;
  stopOrder?: number;
  scheduledTime?: string; // ISO datetime or time string
  estimatedTime?: string; // ISO datetime or time string
}

// Trip-related types (matches backend response)
export interface Trip {
  id: string;
  studentId?: string;
  busId: string;
  busNumber?: string; // For trip history endpoint
  routeId: string;
  routeName?: string;
  tripDate?: string; // YYYY-MM-DD
  tripType?: 'MORNING' | 'EVENING' | 'RETURN';
  status: string; // 'SCHEDULED' | 'BOARDING' | 'COMPLETED' | 'MISSED'
  pickupStop?: Stop | string; // Can be Stop object or just string (stop name)
  droppingStop?: Stop | string; // Can be Stop object or just string
  scheduledTime: string; // ISO datetime or time string
  scheduledDate?: string; // YYYY-MM-DD for trip history endpoint
  actualTime?: string; // ISO datetime
  boardedTime?: string; // ISO datetime
}

// Notification types (matches backend response)
export interface Notification {
  id: string;
  type?: string; // Backend returns different types
  title: string;
  message: string;
  timestamp: string; // ISO datetime
  read?: boolean;
  status?: string; // 'UNREAD' | 'READ'
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  actionUrl?: string;
  createdAt?: string;
}

// Missed Bus types (matches backend response)
export interface MissedBus {
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  missedAt: string; // ISO datetime
  creditsDeducted: number;
}

// Student profile types (matches backend response)
export interface StudentProfile {
  id: string;
  email: string;
  name?: string; // Full name from backend
  firstName?: string; // For backward compatibility
  lastName?: string; // For backward compatibility
  studentNo?: string; // Student number from backend
  program?: string; // Program from backend
  semester?: string; // Semester from backend
  phoneNumber?: string;
  credits: number;
  totalMissedBuses: number;
  homeAddress: string;
  schoolAddress: string;
  enrolledRoutes?: Route[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Dashboard data type
export interface DashboardData {
  student: StudentProfile;
  todayBus: Bus;
  todayTrip: Trip;
  pickupPoint: Stop;
  returnTrip?: Trip;
  missedBusInfo?: MissedBus;
  notifications: Notification[];
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, any>;
}

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Component props types
export interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
