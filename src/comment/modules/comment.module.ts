import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { CommentEntity } from "../entities/comment.entity";
import { UserEntity } from "../../user/entities/user.entity";
import { CommentService } from "../services/comment.service";
import { CommentController } from "../controllers/comment.controller";
import { NotificationsService } from "src/notification/services/notification.service";
import { NotificationEntity } from "src/notification/entities/notification.entity";
import { NotificationsModule } from "src/notification/modules/notification.modile";
import { NotificationsGateway } from "src/notification/services/notifications.gateway";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BlogPostEntity,
      CommentEntity,
      NotificationEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, NotificationsService, NotificationsGateway],
  exports: [],
})
export class CommentModule {}
