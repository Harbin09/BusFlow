import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn('[NotificationsGateway] Connection rejected: No token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'test-secret-key-change-in-production',
      });

      client.data.user = payload;
      client.data.userId = payload.id;
      client.data.userRole = payload.role;

      const userRoom = `user:${payload.id}`;
      client.join(userRoom);

      this.logger.log(
        `[NotificationsGateway] User ${payload.id} connected (${payload.role})`,
      );
      client.emit('connected', { userId: payload.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`[NotificationsGateway] Connection rejected: ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[NotificationsGateway] User disconnected: ${client.id}`);
  }

  broadcastToSpecificUsers(
    userIds: string[],
    notification: {
      id: string;
      title: string;
      message: string;
      priority: string;
      createdAt: Date;
    },
  ): void {
    userIds.forEach((userId) => {
      const room = `user:${userId}`;
      this.server.to(room).emit('notification:new', notification);
    });

    this.logger.log(
      `[NotificationsGateway] Broadcast to ${userIds.length} users`,
    );
  }

  async broadcastToRoute(
    routeId: string,
    notification: {
      id: string;
      title: string;
      message: string;
      priority: string;
      createdAt: Date;
    },
  ): Promise<void> {
    const students = await this.prisma.student.findMany({
      where: { routeId },
      include: { user: true },
    });

    const userIds = students.map((s: any) => s.userId);
    this.broadcastToSpecificUsers(userIds, notification);
  }

  async broadcastToBus(
    busId: string,
    notification: {
      id: string;
      title: string;
      message: string;
      priority: string;
      createdAt: Date;
    },
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const assignments = await this.prisma.studentTripAssignment.findMany({
      where: {
        trip: {
          busId,
          date: { gte: today, lt: tomorrow },
        },
      },
      include: { student: { include: { user: true } } },
    });

    const userIds = assignments.map((a: any) => a.student.userId);
    this.broadcastToSpecificUsers(userIds, notification);
  }

  broadcastToAll(notification: {
    id: string;
    title: string;
    message: string;
    priority: string;
    createdAt: Date;
  }): void {
    this.server.emit('notification:new', notification);
    this.logger.log('[NotificationsGateway] Broadcast to all students');
  }

  @SubscribeMessage('request:missed-notifications')
  async handleMissedNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { since: string },
  ) {
    const userId = client.data.userId;

    try {
      const sinceDate = new Date(data.since);
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
          createdAt: { gte: sinceDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      client.emit('missed-notifications', {
        count: notifications.length,
        notifications,
      });

      this.logger.log(
        `[NotificationsGateway] Sent ${notifications.length} missed notifications to user ${userId}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[NotificationsGateway] Error: ${errorMessage}`);
      client.emit('error', { error: 'Failed to fetch missed notifications' });
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const authHeader = client.handshake.auth.token;
    if (authHeader) return authHeader;

    const headers = client.handshake.headers;
    if (headers.authorization) {
      const parts = headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }

    return null;
  }
}
