import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';
import { SOCKET_EVENTS } from './events';
import { tokenStorage } from '../storage/token';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public connect(): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = tokenStorage.getToken();

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.isConnected = true;
      console.log('[SocketService] Connected to gateway:', this.socket?.id);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      this.isConnected = false;
      console.log('[SocketService] Disconnected:', reason);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, { room });
    }
  }

  public leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room });
    }
  }

  public on<T = any>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }

  public emit(event: string, payload: any): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit(event, payload);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
