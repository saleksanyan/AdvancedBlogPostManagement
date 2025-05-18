import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { NotificationEntity } from "../entities/notification.entity";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  path: "/notification-message",
  namespace: "/notification-message",
  cors: {
    origin: ["http://localhost:3001"],
    credentials: true,
    allowedHeaders: "Content-Type, Authorization",
  },
  transports: ["websocket"],
  serveClient: false,
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);
  private activeConnections = 0;

  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    this.activeConnections--;
    this.logger.log(
      `Disconnected: ${client.id} | User: ${client.data.userId} | Remaining: ${this.activeConnections}`,
    );
  }

  @SubscribeMessage("joinUserRoom")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    if (client.data.userId !== userId) {
      throw new Error("Unauthorized room join attempt");
    }

    client.join(`user-${userId}`);
    this.logger.log(`User ${userId} joined their notification room`);
    return {
      status: "success",
      room: `user-${userId}`,
      userId: userId,
    };
  }

  sendNotification(userId: string, notification: NotificationEntity) {
    this.server.to(`user-${userId}`).emit("notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Notification sent to user ${userId}`);
  }

  broadcastNotification(notification: NotificationEntity) {
    this.server.emit("global-notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
    this.logger.log("Broadcasted notification to all connected clients");
  }

  afterInit() {
    this.logger.log("WebSocket Server initialized on port 3002");
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Connection attempt from ${client.id}`);

      const authToken =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(" ")[1];

      if (!authToken) {
        this.logger.error("No token provided");
        client.emit("auth-error", { message: "Authentication token required" });
        return client.disconnect(true);
      }

      try {
        const payload = this.jwtService.verify(authToken);
        client.data.userId = payload.sub;

        this.activeConnections++;
        this.logger.log(
          `Connected: ${client.id} | User: ${payload.sub} | Total: ${this.activeConnections}`,
        );

        client.emit("connection-ack", {
          status: "connected",
          userId: payload.sub,
          timestamp: new Date().toISOString(),
        });
      } catch (verifyError) {
        this.logger.error(`Token verification failed: ${verifyError.message}`);
        client.emit("auth-error", { message: "Invalid token" });
        return client.disconnect(true);
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit("error", { message: "Connection failed" });
      client.disconnect(true);
    }
  }
}
