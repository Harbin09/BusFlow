import { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/lib/services/auth';
import { trackingSocket } from '@/lib/services/socket';

export interface BusLocation {
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

interface UseTrackingOptions {
  tripId?: string;
  enabled?: boolean;
}

export function useWebSocketTracking(options: UseTrackingOptions = {}) {
  const { tripId, enabled = true } = options;
  const [locations, setLocations] = useState<Map<string, BusLocation>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = getToken() || 'dev-token-admin';

    trackingSocket.connect(token);

    const unsubConnect = trackingSocket.onConnect(() => {
      setIsConnected(true);
      setError(null);
      if (tripId) {
        trackingSocket.subscribeToTrip(tripId);
      }
    });

    const unsubDisconnect = trackingSocket.onDisconnect(() => {
      setIsConnected(false);
    });

    const unsubLocation = trackingSocket.onLocationUpdate((update: any) => {
      setLocations((prev) => {
        const nextMap = new Map(prev);
        const loc: BusLocation = {
          id: update.busId || update.id || `bus-${Date.now()}`,
          busId: update.busId || 'BUS-01',
          tripId: update.tripId,
          latitude: update.latitude ?? 28.6139,
          longitude: update.longitude ?? 77.2090,
          speed: update.speed ?? 0,
          heading: update.heading,
          status: update.status || 'IN_TRANSIT',
          timestamp: update.timestamp || new Date().toISOString(),
          currentStopId: update.currentStopId,
          nextStopId: update.nextStopId,
          totalStudentsOnboard: update.totalStudentsOnboard ?? 0,
          lastUpdated: update.lastUpdated || new Date().toISOString(),
        };
        nextMap.set(loc.busId, loc);
        return nextMap;
      });
    });

    if (trackingSocket.isConnected()) {
      setIsConnected(true);
      if (tripId) {
        trackingSocket.subscribeToTrip(tripId);
      }
    }

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubLocation();
      if (tripId) {
        trackingSocket.unsubscribeFromTrip(tripId);
      }
    };
  }, [enabled, tripId]);

  return {
    locations: Array.from(locations.values()),
    isConnected,
    error,
    locationMap: locations,
  };
}

export function useAllBusLocations(enabled = true) {
  return useWebSocketTracking({ enabled });
}

export function useTripTracking(tripId: string | null, enabled = true) {
  return useWebSocketTracking({
    tripId: tripId || undefined,
    enabled: enabled && !!tripId,
  });
}
