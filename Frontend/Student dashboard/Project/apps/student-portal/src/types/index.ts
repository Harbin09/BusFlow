// Bus-related types
export interface Bus {
  id: string;
  busNumber: string;
  status: 'APPROACHING' | 'ARRIVED' | 'DEPARTED' | 'IN_TRANSIT' | 'DELAYED';
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  capacity: {
    total: number;
    occupied: number;
    available: number;
  };
  eta: number; // in minutes
  etaTime: string; // ISO datetime
}

// Route-related types
export interface Route {
  id: string;
  routeName: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  stops: Stop[];
  totalDistance: number;
  estimatedDuration: number; // in minutes
}

export interface Stop {
  id: string;
  stopName: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  scheduledTime: string; // ISO datetime
  estimatedTime: string; // ISO datetime
}

// Trip-related types
export interface Trip {
  id: string;
  studentId: string;
  busId: string;
  routeId: string;
  tripDate: string; // YYYY-MM-DD
  tripType: 'MORNING' | 'EVENING' | 'RETURN';
  status: 'SCHEDULED' | 'BOARDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  pickupStop: Stop;
  droppingStop: Stop;
  scheduledTime: string; // ISO datetime
  actualTime?: string; // ISO datetime
  boardedTime?: string; // ISO datetime
}

// Notification types
export interface Notification {
  id: string;
  type: 'ROUTE_UPDATE' | 'DELAY_ALERT' | 'CAPACITY_WARNING' | 'RETURN_TRIP' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  timestamp: string; // ISO datetime
  read: boolean;
  actionUrl?: string;
}

// Missed Bus types
export interface MissedBus {
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  missedAt: string; // ISO datetime
  creditsDeducted: number;
}

// Student profile types
export interface StudentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  credits: number;
  totalMissedBuses: number;
  homeAddress: string;
  schoolAddress: string;
  enrolledRoutes: Route[];
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
