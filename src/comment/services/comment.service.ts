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
import { Paginator } from "src/core/paginator/paginator";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
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
      const comment = await queryRunner.manager.getRepository(CommentEntity).findOne({
        where: {id},
        relations: ["post", "author", "post.author",]
      })
      if(userId != comment.author.id && userId != comment.post.author.id) {
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

  async list(page: number, limit: number, postId: string) {
    const options = { page, limit };
    const queryBuilder = this.repository.createQueryBuilder("comment");
    queryBuilder
      .leftJoinAndSelect("comment.author", "author")
      .leftJoinAndSelect("comment.post", "post")
      .where("post.id = :postId", { postId });

    const paginatedResult = await Paginator.paginate<CommentEntity>(
      queryBuilder,
      options,
    );

    return new CommentWithCount(
      paginatedResult.items.map((post) => new CommentOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }
}
