import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationEntity } from "../entities/notification.entity";
import { NotificationsGateway } from "./notifications.gateway";
import { BlogPostEntity } from "src/blog-post/entities/blog-post.entity";
import { NotificationInputDto } from "../dtos/input/notification.dto";
import { NotificationOutputDto } from "../dtos/output/notification-output.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repository: Repository<NotificationEntity>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(notificationDto: NotificationInputDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { postId, message, type, link } = notificationDto;
      const post = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .findOne({
          where: { id: postId },
          relations: ["author"],
        });
      const notification = queryRunner.manager
        .getRepository(NotificationEntity)
        .create({
          user: { id: post.author.id },
          message,
          type,
          link,
        });
      const savedNotification = await queryRunner.manager
        .getRepository(NotificationEntity)
        .save(notification);

      this.notificationsGateway.sendNotification(
        post.author.id,
        savedNotification,
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async markAsRead(notificationId: string) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(NotificationEntity)
        .update(notificationId, {
          is_read: true,
        });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async markAllRead(userId: string) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .getRepository(NotificationEntity)
        .createQueryBuilder()
        .update()
        .set({ is_read: true })
        .where("user_id = :userId", { userId })
        .execute();

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllForUser(userId: string) {
    const notifications: NotificationEntity[] = await this.repository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    return notifications.map((n) => new NotificationOutputDto(n));
  }
}
