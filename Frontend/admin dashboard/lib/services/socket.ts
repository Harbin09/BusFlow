import io, { Socket } from 'socket.io-client';
import { TrackingUpdate } from '../types';

export type LocationUpdateCallback = (data: TrackingUpdate) => void;
export type ConnectionCallback = () => void;
export type DisconnectionCallback = () => void;

export class TrackingSocket {
  private socket: Socket | null = null;
  private url: string;
  private token: string | null = null;
  private subscriptions: Set<string> = new Set();
  private locationCallbacks: Set<LocationUpdateCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private disconnectionCallbacks: Set<DisconnectionCallback> = new Set();

  constructor(url: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') {
    this.url = url;
  }

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    // Clean raw token without Bearer prefix for Socket.IO auth
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    this.token = cleanToken;

    this.socket = io(this.url, {
      auth: {
        token: cleanToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connectionCallbacks.forEach(cb => cb());
    });

    this.socket.on('disconnect', () => {
      this.disconnectionCallbacks.forEach(cb => cb());
    });

    this.socket.on('location:update', (data: any) => {
      // Normalize location update payload
      const update: TrackingUpdate = {
        busId: data.busId || data.id,
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed ?? 0,
        heading: data.heading,
        status: data.status || 'IN_TRANSIT',
        timestamp: data.timestamp || new Date().toISOString(),
        currentStopId: data.currentStopId,
        nextStopId: data.nextStopId,
        totalStudentsOnboard: data.totalStudentsOnboard ?? 0,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
      this.locationCallbacks.forEach(cb => cb(update));
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribeToTrip(tripId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot subscribe to trip');
      return;
    }

    this.subscriptions.add(tripId);
    this.socket.emit('subscribe:trip', { tripId });
  }

  unsubscribeFromTrip(tripId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.subscriptions.delete(tripId);
    this.socket.emit('unsubscribe:trip', { tripId });
  }

  onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.locationCallbacks.add(callback);
    return () => {
      this.locationCallbacks.delete(callback);
    };
  }

  onConnect(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  onDisconnect(callback: DisconnectionCallback): () => void {
    this.disconnectionCallbacks.add(callback);
    return () => {
      this.disconnectionCallbacks.delete(callback);
    };
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

export const trackingSocket = new TrackingSocket();
