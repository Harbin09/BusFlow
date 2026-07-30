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
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
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
          config.headers.Authorization = `Bearer ${token}`;
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
      return response.data.data || null;
    } catch (error) {
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
      const [
        student,
        todayBus,
        todayTrip,
        pickupPoint,
        returnTrip,
        missedBusInfo,
        notifications,
      ] = await Promise.all([
        this.getStudentProfile(),
        this.getTodayBus(),
        this.getTodayTrip(),
        this.getPickupPoint(),
        this.getReturnTrip(),
        this.getMissedBusInfo(),
        this.getNotifications(),
      ]);

      return {
        student,
        todayBus,
        todayTrip,
        pickupPoint,
        returnTrip,
        missedBusInfo,
        notifications,
      };
    } catch (error) {
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
}

// Export singleton instance
export const studentApi = new StudentApiService();
