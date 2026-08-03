import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { TrackingService } from './services/tracking.service';

/**
 * TrackingGateway handles real-time location updates via WebSocket
 *
 * Events:
 * - location:update - Broadcast when bus location changes
 * - subscribe:trip - Client subscribes to a trip's location updates
 * - unsubscribe:trip - Client unsubscribes from a trip
 */
@WebSocketGateway({
  namespace: 'tracking',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly trackingService: TrackingService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle client connection with JWT validation
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`[TrackingGateway] Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT and attach user to socket
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'test-secret-key-change-in-production',
      });

      client.data.user = payload;
      this.logger.log(
        `[TrackingGateway] Client connected (authenticated as ${payload.id}): ${client.id}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `[TrackingGateway] Connection rejected: Invalid token - ${errorMessage}`,
      );
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`[TrackingGateway] Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast location update to all subscribed clients
   */
  broadcastLocationUpdate(data: {
    tripId: string;
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading?: number;
    timestamp: Date;
  }): void {
    this.server.emit('location:update', data);
    this.server.to(`trip:${data.tripId}`).emit('location:update', data);

    this.logger.debug(
      `[TrackingGateway] Broadcast location update for trip ${data.tripId}`,
    );
  }

  /**
   * Handle trip subscription with authorization
   * Verifies user is assigned to the trip before allowing subscription
   *
   * @param client The client socket
   * @param data Subscribe request with tripId
   */
  @SubscribeMessage('subscribe:trip')
  async handleSubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    try {
      const user = client.data.user;

      if (!user) {
        client.emit('subscribe:error', {
          success: false,
          error: 'Unauthorized: No user context',
          tripId: data.tripId,
        });
        return;
      }

      // Verify user is assigned to this trip
      const isAuthorized = await this.verifyTripAccess(user.id, user.role, data.tripId);

      if (!isAuthorized) {
        this.logger.warn(
          `[TrackingGateway] Unauthorized subscription attempt: User ${user.id} (role: ${user.role}) tried to subscribe to trip ${data.tripId}`,
        );
        client.emit('subscribe:error', {
          success: false,
          error: 'Forbidden: You are not assigned to this trip',
          tripId: data.tripId,
        });
        return;
      }

      // Subscribe to trip room
      const room = `trip:${data.tripId}`;
      client.join(room);

      this.logger.log(
        `[TrackingGateway] Client ${client.id} (user: ${user.id}) subscribed to trip ${data.tripId}`,
      );

      // Send acknowledgment
      client.emit('subscribe:ack', {
        success: true,
        tripId: data.tripId,
        message: `Subscribed to trip ${data.tripId}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TrackingGateway] Error during subscription: ${errorMessage}`);
      client.emit('subscribe:error', {
        success: false,
        error: 'Internal server error during subscription',
      });
    }
  }

  /**
   * Handle trip unsubscription
   */
  @SubscribeMessage('unsubscribe:trip')
  handleUnsubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    const room = `trip:${data.tripId}`;
    client.leave(room);

    this.logger.log(
      `[TrackingGateway] Client ${client.id} unsubscribed from trip ${data.tripId}`,
    );

    // Send acknowledgment
    client.emit('unsubscribe:ack', {
      success: true,
      tripId: data.tripId,
      message: `Unsubscribed from trip ${data.tripId}`,
    });
  }

  /**
   * Handle ping to keep connection alive
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong');
  }

  /**
   * Get list of active simulations (for monitoring)
   * Requires authentication
   */
  @SubscribeMessage('get:active-simulations')
  handleGetActiveSimulations(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    if (!user) {
      client.emit('error', { error: 'Unauthorized' });
      return;
    }

    const simulations = this.trackingService.getActiveSimulations();
    client.emit('active-simulations', {
      count: simulations.length,
      tripIds: simulations,
    });
  }

  /**
   * Extract JWT token from WebSocket handshake
   * Looks for token in auth header or query parameters
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // Try to get token from auth header first
    const authHeader = client.handshake.auth.token;
    if (authHeader) {
      return authHeader;
    }

    // Try to get from Authorization header as "Bearer <token>"
    const headers = client.handshake.headers;
    if (headers.authorization) {
      const parts = headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }

    return null;
  }

  /**
   * Verify if user has access to a trip
   * - Students can only access their assigned trips
   * - Drivers can only access their assigned trips
   * - Admins can access any trip (future role)
   */
  private async verifyTripAccess(
    userId: string,
    userRole: string,
    tripId: string,
  ): Promise<boolean> {
    try {
      // Admins can access any trip (future role)
      if (userRole === 'ADMIN') {
        return true;
      }

      if (userRole === 'STUDENT') {
        // Verify student is assigned to this trip
        const assignment = await this.prisma.studentTripAssignment.findFirst({
          where: {
            trip: {
              id: tripId,
            },
            student: {
              user: {
                id: userId,
              },
            },
          },
        });

        return !!assignment;
      }

      if (userRole === 'DRIVER') {
        // Verify driver is assigned to this trip
        const trip = await this.prisma.trip.findUnique({
          where: { id: tripId },
        });

        return trip?.driverId === userId;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[TrackingGateway] Error verifying trip access: ${errorMessage}`,
      );
      return false;
    }
  }
}
