export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Client to Server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  TELEMETRY_EMIT: 'driver:location_update',
  PANIC_EMIT: 'driver:panic_alert',

  // Server to Client
  LOCATION_UPDATE: 'bus:location_update',
  TRIP_STATUS_CHANGE: 'trip:status_change',
  GEOFENCE_ALERT: 'geofence:alert',
  PASSENGER_UPDATE: 'passenger:count_update',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
