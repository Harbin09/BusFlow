export const APP_NAME = 'BusFlow';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const DEFAULT_CAMPUS_CENTER = {
  latitude: 28.6139,
  longitude: 77.2090,
};

export const REFRESH_INTERVAL_MS = 5000;
