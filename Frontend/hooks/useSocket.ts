import { useEffect } from 'react';
import { socketService } from '@/services/socket/socket';

export function useSocketEvent<T = any>(eventName: string, handler: (data: T) => void, room?: string) {
  useEffect(() => {
    socketService.connect();

    if (room) {
      socketService.joinRoom(room);
    }

    const unsubscribe = socketService.on<T>(eventName, handler);

    return () => {
      unsubscribe();
      if (room) {
        socketService.leaveRoom(room);
      }
    };
  }, [eventName, handler, room]);
}
