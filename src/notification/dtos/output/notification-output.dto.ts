import { NotificationEntity } from "src/notification/entities/notification.entity";

export class NotificationOutputDto {
  userId: string;
  message: string;
  type: string;
  link?: string;
  createdAt: Date;
  id: string;
  isRead: boolean;

  constructor(notificationEntity: NotificationEntity) {
    this.id = notificationEntity.id;
    this.userId = notificationEntity.user.id;
    this.message = notificationEntity.message;
    this.type = notificationEntity.type;
    this.link = notificationEntity.link;
    this.createdAt = notificationEntity.created_at;
    this.isRead = notificationEntity.is_read;
  }
}
