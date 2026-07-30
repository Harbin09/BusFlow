export const SOCKET_ROOMS = {
  ADMIN_FLEET: 'room:admin_fleet',
  ROUTE: (routeId: string) => `room:route_${routeId}`,
  BUS: (busId: string) => `room:bus_${busId}`,
  TRIP: (tripId: string) => `room:trip_${tripId}`,
};
