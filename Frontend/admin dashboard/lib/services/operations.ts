import { apiClient } from '../api';

export interface TripGenerationRequest {
  date: string; // YYYY-MM-DD format
}

export interface TripGenerationResult {
  date: string;
  results: any[];
  summary: {
    total: number;
    approved: number;
    rejected: number;
  };
}

export interface DriverTodayResponse {
  success: boolean;
  data: {
    id: string;
    routeId: string;
    busId: string;
    driverId: string;
    date: string;
    departureTime: string;
    arrivalTime?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
    generatedByRuleEngine: boolean;
    timetableId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StudentTodayResponse {
  success: boolean;
  data: {
    id: string;
    routeId: string;
    busId: string;
    driverId: string;
    date: string;
    departureTime: string;
    arrivalTime?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
    generatedByRuleEngine: boolean;
    timetableId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BusLocationResponse {
  id: string;
  busId: string;
  tripId?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'IN_TRANSIT' | 'AT_STOP' | 'MAINTENANCE' | 'OFFLINE';
  timestamp: string;
  currentStopId?: string;
  nextStopId?: string;
  totalStudentsOnboard: number;
  lastUpdated: string;
}

export interface PassengerListResponse {
  success: boolean;
  data: {
    passengers: Array<{
      id: string;
      studentId: string;
      tripId: string;
      boardingStopId?: string;
      status: 'SCHEDULED' | 'BOARDED' | 'ALIGHTED' | 'NO_SHOW' | 'CANCELLED';
      boardingTime?: string;
      alightingTime?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    summary: {
      total: number;
      active: number;
      noshow: number;
    };
  };
}

export interface TripActionResponse {
  success: boolean;
  message: string;
}

export const operationsService = {
  /**
   * Generate trips for a specific date
   * PUBLIC endpoint - no authentication required
   */
  async generateTrips(date: string): Promise<TripGenerationResult> {
    const response = await apiClient.post<TripGenerationResult>('/api/v1/trips/generate', {
      date,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { date, results: [], summary: { total: 0, approved: 0, rejected: 0 } };
  },

  /**
   * Get today's trip for driver
   * DRIVER authentication required
   */
  async getDriverTodayTrip(): Promise<DriverTodayResponse['data']> {
    const response = await apiClient.get<DriverTodayResponse>('/api/v1/drivers/workflow/today');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data?.data) {
      throw new Error('No trip assigned for today');
    }
    return response.data.data;
  },

  /**
   * Start a driver's trip
   * DRIVER authentication required
   */
  async startTrip(tripId: string): Promise<void> {
    const response = await apiClient.post<TripActionResponse>(
      `/api/v1/drivers/workflow/trips/${tripId}/start`,
      {}
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * End a driver's trip
   * DRIVER authentication required
   */
  async endTrip(tripId: string): Promise<void> {
    const response = await apiClient.post<TripActionResponse>(
      `/api/v1/drivers/workflow/trips/${tripId}/end`,
      {}
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Get passenger list for a trip
   * DRIVER authentication required
   */
  async getTripPassengers(tripId: string): Promise<PassengerListResponse['data']> {
    const response = await apiClient.get<PassengerListResponse>(
      `/api/v1/drivers/workflow/trips/${tripId}/passengers`
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data?.data) {
      return { passengers: [], summary: { total: 0, active: 0, noshow: 0 } };
    }
    return response.data.data;
  },

  /**
   * Get today's trip for student
   * STUDENT authentication required
   */
  async getStudentTodayTrip(): Promise<StudentTodayResponse['data']> {
    const response = await apiClient.get<StudentTodayResponse>('/api/v1/students/workflow/today');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data?.data) {
      throw new Error('No trip assigned for today');
    }
    return response.data.data;
  },

  /**
   * Get current bus location for student's trip
   * STUDENT authentication required
   */
  async getBusLocation(tripId: string): Promise<BusLocationResponse> {
    const response = await apiClient.get<BusLocationResponse>(
      `/api/v1/students/workflow/bus-location/${tripId}`
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Bus location not available');
    }
    return response.data;
  },

  /**
   * Update bus location (GPS tracking)
   * DRIVER authentication required
   */
  async updateLocation(data: {
    tripId: string;
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading?: number;
    timestamp?: string;
  }): Promise<any> {
    const response = await apiClient.post('/api/v1/tracking/location', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  },

  /**
   * Activate trip and start GPS tracking simulation
   * DRIVER authentication required
   */
  async activateTracking(tripId: string): Promise<void> {
    const response = await apiClient.post<TripActionResponse>(
      '/api/v1/tracking/activate',
      { tripId }
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Complete trip and stop tracking
   * DRIVER authentication required
   */
  async completeTracking(tripId: string): Promise<void> {
    const response = await apiClient.post<TripActionResponse>(
      '/api/v1/tracking/complete',
      { tripId }
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
