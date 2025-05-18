import { Module } from "@nestjs/common";
import { NotificationEntity } from "../entities/notification.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "../services/notification.service";
import { NotificationsController } from "../controllers/notifications.controller";
import { NotificationsGateway } from "../services/notifications.gateway";
import { UserEntity } from "src/user/entities/user.entity";
import { BlogPostEntity } from "src/blog-post/entities/blog-post.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, UserEntity, BlogPostEntity]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
