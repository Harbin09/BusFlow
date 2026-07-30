import { getToken, logout } from './services/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      const response = await fetch(`${this.baseUrl}/api/v1/health`, { method: 'GET' });
      return response.ok;
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
      // Add JWT token to Authorization header
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (fetchOptions.headers && typeof fetchOptions.headers === 'object') {
        Object.entries(fetchOptions.headers).forEach(([key, value]) => {
          headers[key] = String(value);
        });
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        // Handle unauthorized - clear token and redirect to login
        if (response.status === 401) {
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error:
            errorData.detail ||
            errorData.message ||
            errorData.error ||
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
      const isOnline = await this.checkNetworkStatus();

      if (!isOnline) {
        // Network is offline, try to return cached data
        const cached = this.getCachedData(url, method);
        if (cached) {
          return {
            data: cached,
            error: 'Network offline - using cached data',
            status: 0,
          };
        }

        // No cached data available
        return {
          data: null,
          error: 'Network offline and no cached data available',
          status: 0,
        };
      }

      // Network error
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: null,
        error: `Request failed: ${errorMessage}`,
        status: 500,
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

// API helpers for endpoints that don't exist yet
// These exports are deprecated - use operationsService instead
// REMOVED: dashboardApi, fleetApi, routesApi, temporaryRoutesApi, analyticsApi, trackingApi, studentsApi, driversApi, weatherApi, notificationsApi, timetableApi
// All non-existent endpoints have been removed. Use operationsService for real backend operations.
