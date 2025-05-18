import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotificationsService } from "../services/notification.service";
import { NotificationInputDto } from "../dtos/input/notification.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { NotificationOutputDto } from "../dtos/output/notification-output.dto";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all notifications for the user" })
  @ApiResponse({
    status: 200,
    description: "List of notifications for the user",
    type: [NotificationOutputDto],
  })
  async getNotifications(@Req() req: Request) {
    const userId = (req as any).user;
    return await this.notificationsService.findAllForUser(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new notification" })
  @ApiBody({
    description: "The notification data to create a new notification",
    type: NotificationInputDto,
  })
  @ApiResponse({
    status: 201,
    description: "Notification successfully created",
  })
  async create(@Body() notificationInputDto: NotificationInputDto) {
    return await this.notificationsService.create(notificationInputDto);
  }

  @Patch("mark-all-read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications as read for the user" })
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read",
  })
  async markAllRead(@Req() req: Request) {
    const userId = (req as any).user;
    return await this.notificationsService.markAllRead(userId);
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark a specific notification as read" })
  @ApiParam({
    name: "id",
    description: "The unique identifier of the notification",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  async markAsRead(@Param("id", CheckUUIDPipe) id: string) {
    return await this.notificationsService.markAsRead(id);
  }
}
