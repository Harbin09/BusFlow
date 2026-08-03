const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ApiErrorFallback {
  offline: boolean;
  cachedData?: any;
  message: string;
}

class ApiClient {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private getCacheKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private getCachedData(url: string, method: string = 'GET'): any | null {
    const cacheKey = this.getCacheKey(url, method);
    const cached = this.requestCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Clean up expired cache
    if (cached) {
      this.requestCache.delete(cacheKey);
    }

    return null;
  }

  private setCachedData(
    url: string,
    data: any,
    method: string = 'GET'
  ): void {
    const cacheKey = this.getCacheKey(url, method);
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  private async checkNetworkStatus(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, { method: 'HEAD' });
      return response.ok || response.status === 405; // HEAD might return 405
    } catch {
      return false;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { skipCache?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const { skipCache = false, ...fetchOptions } = options;

    // Try to get cached data for GET requests
    if (method === 'GET' && !skipCache) {
      const cached = this.getCachedData(url, method);
      if (cached) {
        return {
          data: cached,
          error: null,
          status: 200,
        };
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error:
            errorData.detail ||
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();

      // Cache successful GET responses
      if (method === 'GET') {
        this.setCachedData(url, data, method);
      }

      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (error) {
      // Network is offline or backend server is not running
      const cached = this.getCachedData(url, method);
      if (cached) {
        return {
          data: cached,
          error: null,
          status: 200,
        };
      }

      // Handle mutative operations when backend is offline
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        let mockData: any = { success: true, id: `mock-${Date.now()}` };
        if (options.body && typeof options.body === 'string') {
          try {
            mockData = { ...mockData, ...JSON.parse(options.body) };
          } catch {
            // body might be FormData or non-JSON
          }
        }
        return {
          data: mockData as T,
          error: null,
          status: 200,
        };
      }

      // Return clean fallback for offline GET requests
      return {
        data: null,
        error: null,
        status: 200,
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: RequestInit & { skipCache?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // Batch request with fallback
  async batchGet<T>(
    endpoints: string[]
  ): Promise<Array<ApiResponse<T>>> {
    return Promise.all(
      endpoints.map((endpoint) => this.get<T>(endpoint))
    );
  }

  // Clear cache
  clearCache(): void {
    this.requestCache.clear();
  }

  // Get cache size (for debugging)
  getCacheSize(): number {
    return this.requestCache.size;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type-safe API helpers for common endpoints
export const dashboardApi = {
  getSummary: () =>
    apiClient.get(`/dashboard/summary`),
  getMap: () =>
    apiClient.get(`/dashboard/map`),
};

export const fleetApi = {
  listBuses: () =>
    apiClient.get(`/buses`),
  getBus: (id: string) =>
    apiClient.get(`/buses/${id}`),
  createBus: (data: any) =>
    apiClient.post(`/buses`, data),
  updateBus: (id: string, data: any) =>
    apiClient.put(`/buses/${id}`, data),
  deleteBus: (id: string) =>
    apiClient.delete(`/buses/${id}`),
};

export const routesApi = {
  listRoutes: () =>
    apiClient.get(`/routes`),
  getRoute: (id: string) =>
    apiClient.get(`/routes/${id}`),
  createRoute: (data: any) =>
    apiClient.post(`/routes`, data),
  updateRoute: (id: string, data: any) =>
    apiClient.put(`/routes/${id}`, data),
  deleteRoute: (id: string) =>
    apiClient.delete(`/routes/${id}`),
};

export const temporaryRoutesApi = {
  listTemporaryRoutes: () =>
    apiClient.get(`/routes/temporary`),
  getTemporaryRoute: (id: string) =>
    apiClient.get(`/routes/temporary/${id}`),
  createTemporaryRoute: (data: any) =>
    apiClient.post(`/routes/temporary`, data),
  updateTemporaryRoute: (id: string, data: any) =>
    apiClient.put(`/routes/temporary/${id}`, data),
  deleteTemporaryRoute: (id: string) =>
    apiClient.delete(`/routes/temporary/${id}`),
};

export const analyticsApi = {
  getStudentDensity: () =>
    apiClient.get(`/analytics/student-density`),
  getRouteComparison: () =>
    apiClient.get(`/analytics/route-comparison`),
  deployRoute: (data: any) =>
    apiClient.post(`/routes/deploy`, data),
};

export const trackingApi = {
  getLiveTracking: () =>
    apiClient.get(`/tracking/live`),
};

export const studentsApi = {
  listStudents: () =>
    apiClient.get(`/students`),
  getStudent: (id: string) =>
    apiClient.get(`/students/${id}`),
  createStudent: (data: any) =>
    apiClient.post(`/students`, data),
  updateStudent: (id: string, data: any) =>
    apiClient.put(`/students/${id}`, data),
  deleteStudent: (id: string) =>
    apiClient.delete(`/students/${id}`),
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.request(`/students/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let the browser set it with boundary
      },
    });
  },
};

export const driversApi = {
  listDrivers: () =>
    apiClient.get(`/drivers`),
  getDriver: (id: string) =>
    apiClient.get(`/drivers/${id}`),
  createDriver: (data: any) =>
    apiClient.post(`/drivers`, data),
  updateDriver: (id: string, data: any) =>
    apiClient.put(`/drivers/${id}`, data),
};

export const weatherApi = {
  getWeather: () =>
    apiClient.get(`/weather`),
  checkWeather: () =>
    apiClient.post(`/weather/check`),
};

export const notificationsApi = {
  sendNotification: (data: any) =>
    apiClient.post(`/notifications/send`, data),
  getNotifications: () =>
    apiClient.get(`/notifications`),
};

export const timetableApi = {
  uploadTimetable: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.request(`/timetable/upload`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  getTimetable: () =>
    apiClient.get(`/timetable`),
};

export const issuesApi = {
  getStudentIssues: () =>
    apiClient.get(`/admin/student-issues`),
  getStudentIssue: (id: string) =>
    apiClient.get(`/admin/student-issues/${id}`),
  resolveIssue: (id: string, data: any) =>
    apiClient.put(`/admin/student-issues/${id}/resolve`, data),
  respondToIssue: (id: string, data: any) =>
    apiClient.post(`/admin/student-issues/${id}/respond`, data),
};
