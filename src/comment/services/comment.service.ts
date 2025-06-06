import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "src/comment/entities/comment.entity";
import { Repository } from "typeorm";
import { CreateCommentInputDto } from "../dtos/input/create-comment.dto";
import { UserEntity } from "src/user/entities/user.entity";
import { BlogPostEntity } from "src/blog-post/entities/blog-post.entity";
import { CommentOutputDto } from "../dtos/output/output-comment.dto";
import { UserNotFoundException } from "src/core/exceptions/user-not-found.exception";
import { BlogPostNotFoundException } from "src/core/exceptions/blog-post-not-found.exception";
import { CommentNotFoundException } from "src/core/exceptions/comment-not-found.exception";
import { CommentWithCount } from "../dtos/output/comment.return-type";
import { NotificationsService } from "src/notification/services/notification.service";
import { NotificationInputDto } from "src/notification/dtos/input/notification.dto";
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
    private notificationsService: NotificationsService,
  ) {}

  async addComment(authorId: string, commentDto: CreateCommentInputDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const author = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { id: authorId },
        });

      if (!author) {
        throw new UserNotFoundException();
      }

      const post = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .findOne({
          where: { id: commentDto.postId },
        });

      if (!post) {
        throw new BlogPostNotFoundException();
      }

      const commentEntity = queryRunner.manager
        .getRepository(CommentEntity)
        .create({
          author: author,
          post: post,
          content: commentDto.comment,
        });

      await queryRunner.manager
        .getRepository(CommentEntity)
        .save(commentEntity);

      const resultedComment = await queryRunner.manager
        .getRepository(CommentEntity)
        .findOne({
          where: { id: commentEntity.id },
          relations: ["author", "post"],
        });

      const notificationDto = new NotificationInputDto();
      notificationDto.postId = post.id;
      notificationDto.link = `/post/${post.id}`;
      notificationDto.message = `New comment on your post: "${commentDto.comment}"`;
      notificationDto.type = "NEW_COMMENT";

      await this.notificationsService.create(notificationDto);

      await queryRunner.commitTransaction();

      return new CommentOutputDto(resultedComment);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, userId: string) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = await queryRunner.manager
        .getRepository(CommentEntity)
        .findOne({
          where: { id },
          relations: ["post", "author", "post.author"],
        });
      if (userId != comment.author.id && userId != comment.post.author.id) {
        throw new UnauthorizedException();
      }

      const result = await queryRunner.manager
        .getRepository(CommentEntity)
        .delete(id);

      if (result.affected === 0) {
        throw new CommentNotFoundException();
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getById(id: string) {
    const comment = await this.repository.findOne({
      where: { id: id },
      relations: ["author", "post"],
    });

    if (!comment) {
      throw new CommentNotFoundException();
    }

    return new CommentOutputDto(comment);
  }

  async list(postId: string) {
    const queryBuilder = this.repository.createQueryBuilder("comment");

    queryBuilder
      .leftJoinAndSelect("comment.author", "author")
      .leftJoinAndSelect("comment.post", "post")
      .where("post.id = :postId", { postId })
      .orderBy("comment.created_at", "ASC");

    const comments = await queryBuilder.getMany();
    const totalItems = comments.length;

    return new CommentWithCount(
      comments.map((comment) => new CommentOutputDto(comment)),
      totalItems,
    );
  }
}
