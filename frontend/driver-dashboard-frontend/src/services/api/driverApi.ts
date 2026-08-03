import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface MissedBusStudent {
  id: string;
  studentNo: string;
  name: string;
  program: string;
  semester: string;
  pickupStop: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  alternateStop?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'MISSED' | 'BOARDED_ALTERNATE' | 'RESOLVED';
}

class DriverApiService {
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

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      },
    );
  }

  async getAssignedBus(): Promise<any> {
    try {
      const response = await this.api.get<ApiResponse<any>>('/drivers/assigned-bus');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateLocation(latitude: number, longitude: number, accuracy?: number): Promise<void> {
    try {
      const busResponse = await this.getAssignedBus();
      const busId = busResponse?.id;

      if (!busId) {
        throw new Error('No bus assigned');
      }

      await this.api.post(`/drivers/bus/${busId}/location`, {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
        updatedBy: 'GEOLOCATION',
      });
    } catch (error) {
      throw error;
    }
  }

  async getPassengerList(): Promise<any[]> {
    try {
      const busResponse = await this.getAssignedBus();
      const busId = busResponse?.id;

      if (!busId) {
        throw new Error('No bus assigned');
      }

      const response = await this.api.get<ApiResponse<any[]>>(
        `/drivers/bus/${busId}/passengers`
      );
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  async getMissedBusStudents(): Promise<MissedBusStudent[]> {
    try {
      const busResponse = await this.getAssignedBus();
      const busId = busResponse?.id;

      if (!busId) {
        throw new Error('No bus assigned');
      }

      const response = await this.api.get<ApiResponse<MissedBusStudent[]>>(
        `/drivers/bus/${busId}/missed-students`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching missed students:', error);
      return [];
    }
  }

  async getDriverNotifications(limit: number = 20): Promise<any[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>(
        '/drivers/notifications',
        { params: { limit } }
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.post(`/drivers/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async getTripDetails(): Promise<any> {
    try {
      const response = await this.api.get<ApiResponse<any>>('/drivers/current-trip');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: any }> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/auth/login', {
        email,
        password,
      });

      if (!response.data.data || !response.data.data.accessToken) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export const driverApi = new DriverApiService();
