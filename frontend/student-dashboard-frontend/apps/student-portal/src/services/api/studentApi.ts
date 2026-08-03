import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  Bus,
  Trip,
  Stop,
  Notification,
  StudentProfile,
  MissedBus,
  ApiResponse,
  ApiError,
} from '../../types';

class StudentApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
    this.api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Auth header set with token:', token.substring(0, 20) + '...');
        } else {
          console.warn('No token found in localStorage');
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      },
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'No internet connection or server unavailable',
        status: 0,
      };
    }

    const status = error.response.status;
    const data = error.response.data as any;

    return {
      code: data?.error?.code || `HTTP_${status}`,
      message:
        data?.error?.message || error.message || 'An error occurred',
      status,
      details: data?.error?.details,
    };
  }

  /**
   * Get today's bus assignment for the student
   */
  async getTodayBus(): Promise<Bus | null> {
    try {
      const response = await this.api.get<ApiResponse<Bus | null>>(
        '/students/today-bus',
      );
      console.log('[API] getTodayBus response:', response.data);
      return response.data.data || null;
    } catch (error) {
      console.error('[API] getTodayBus error:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get today's trip details
   */
  async getTodayTrip(): Promise<Trip | null> {
    try {
      const response = await this.api.get<ApiResponse<Trip | null>>(
        '/students/today-trip',
      );
      return response.data.data || null;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get pickup point for today's trip
   */
  async getPickupPoint(): Promise<Stop | null> {
    try {
      const response = await this.api.get<ApiResponse<Stop | null>>(
        '/students/pickup-point',
      );
      return response.data.data || null;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get return trip details
   */
  async getReturnTrip(): Promise<Trip | null> {
    try {
      const response = await this.api.get<ApiResponse<Trip | null>>(
        '/students/return-trip',
      );
      return response.data.data || null;
    } catch (error) {
      // Return null if no return trip, don't throw
      return null;
    }
  }

  /**
   * Get missed bus information
   */
  async getMissedBusInfo(): Promise<MissedBus | null> {
    try {
      const response = await this.api.get<ApiResponse<MissedBus | null>>(
        '/students/missed-bus',
      );
      return response.data.data || null;
    } catch (error) {
      // Return null if no missed bus, don't throw
      return null;
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(limit: number = 10): Promise<Notification[]> {
    try {
      const response = await this.api.get<ApiResponse<Notification[]>>(
        '/students/notifications',
        {
          params: { limit },
        },
      );
      return response.data.data || [];
    } catch (error) {
      // Return empty array if notifications fail
      return [];
    }
  }

  /**
   * Get student profile
   */
  async getStudentProfile(): Promise<StudentProfile> {
    try {
      const response = await this.api.get<ApiResponse<StudentProfile>>(
        '/students/profile',
      );
      if (!response.data.data) {
        throw new Error('Failed to fetch student profile');
      }
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.post(`/students/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Don't throw, just log
    }
  }

  /**
   * Get all dashboard data at once
   */
  async getDashboardData() {
    try {
      console.log('[API] Starting getDashboardData...');

      const results = await Promise.allSettled([
        this.getStudentProfile(),
        this.getTodayBus(),
        this.getTodayTrip(),
        this.getPickupPoint(),
        this.getReturnTrip(),
        this.getMissedBusInfo(),
        this.getNotifications(),
      ]);

      const [studentResult, todayBusResult, todayTripResult, pickupPointResult, returnTripResult, missedBusInfoResult, notificationsResult] = results;

      console.log('[API] Dashboard API Results:', {
        studentStatus: studentResult.status,
        todayBusStatus: todayBusResult.status,
        todayTripStatus: todayTripResult.status,
        pickupPointStatus: pickupPointResult.status,
      });

      if (studentResult.status === 'rejected') {
        console.error('[API] Student profile error:', studentResult.reason);
      }
      if (todayBusResult.status === 'rejected') {
        console.error('[API] Today bus error:', todayBusResult.reason);
      }

      return {
        student: studentResult.status === 'fulfilled' ? studentResult.value : null,
        todayBus: todayBusResult.status === 'fulfilled' ? todayBusResult.value : null,
        todayTrip: todayTripResult.status === 'fulfilled' ? todayTripResult.value : null,
        pickupPoint: pickupPointResult.status === 'fulfilled' ? pickupPointResult.value : null,
        returnTrip: returnTripResult.status === 'fulfilled' ? returnTripResult.value : null,
        missedBusInfo: missedBusInfoResult.status === 'fulfilled' ? missedBusInfoResult.value : null,
        notifications: notificationsResult.status === 'fulfilled' ? notificationsResult.value : [],
      };
    } catch (error) {
      console.error('[API] getDashboardData error:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Login with email and password
   * Returns JWT token and user info
   */
  async login(email: string, password: string): Promise<{ accessToken: string; user: StudentProfile }> {
    try {
      const response = await this.api.post<ApiResponse<{ accessToken: string; user: StudentProfile }>>('/auth/login', {
        email,
        password,
      });

      if (!response.data.data || !response.data.data.accessToken) {
        throw new Error('Invalid credentials');
      }

      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.data.accessToken);

      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Logout by removing the stored token
   */
  logout(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get available buses for live tracking
   */
  async getAvailableBuses(): Promise<Bus[]> {
    try {
      const response = await this.api.get<ApiResponse<Bus[]>>(
        '/students/available-buses',
      );
      return response.data.data || [];
    } catch (error) {
      // Return empty array if available buses fail
      return [];
    }
  }

  /**
   * Get trip history for the student
   */
  async getTripHistory(): Promise<Trip[]> {
    try {
      const response = await this.api.get<ApiResponse<Trip[]>>(
        '/students/trip-history',
      );
      return response.data.data || [];
    } catch (error) {
      // Return empty array if trip history fails
      return [];
    }
  }

  /**
   * Report an issue
   */
  async reportIssue(issueData: {
    title: string;
    description: string;
    type: 'BUS_ISSUE' | 'DRIVER_ISSUE' | 'ROUTE_ISSUE' | 'APP_ISSUE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    attachmentUrl?: string;
  }): Promise<{ id: string; status: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ id: string; status: string }>>(
        '/students/issues/report',
        issueData,
      );
      if (!response.data.data) {
        throw new Error('Failed to report issue');
      }
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get issue history
   */
  async getIssueHistory(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    type: 'BUS_ISSUE' | 'DRIVER_ISSUE' | 'ROUTE_ISSUE' | 'APP_ISSUE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    resolvedAt?: string;
  }>> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>(
        '/students/issues/history',
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(limit: number = 50): Promise<Array<{
    id: string;
    title: string;
    message: string;
    type: 'DELAY' | 'STATUS_UPDATE' | 'ALERT' | 'GENERAL';
    status?: string;
    readAt?: string;
    createdAt: string;
  }>> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>(
        '/students/notifications',
        {
          params: { limit },
        },
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    delayAlerts: boolean;
    statusUpdates: boolean;
  }> {
    try {
      const response = await this.api.get<ApiResponse<any>>(
        '/students/notifications/preferences',
      );
      return response.data.data || {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        delayAlerts: true,
        statusUpdates: true,
      };
    } catch (error) {
      return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        delayAlerts: true,
        statusUpdates: true,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    delayAlerts?: boolean;
    statusUpdates?: boolean;
  }): Promise<void> {
    try {
      await this.api.post(
        '/students/notifications/preferences',
        preferences,
      );
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Seed demo data for testing
   */
  async seedDemoData(): Promise<any> {
    try {
      const response = await this.api.post<ApiResponse<any>>(
        '/students/seed-demo-data',
      );
      return response.data.data;
    } catch (error) {
      console.log('Seed demo data request completed');
      return null;
    }
  }
}

// Export singleton instance
export const studentApi = new StudentApiService();
