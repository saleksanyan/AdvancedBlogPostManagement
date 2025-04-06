import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { CommentEntity } from "../entities/comment.entity";
import { UserEntity } from "../../user/entities/user.entity";
import { CommentService } from "../services/comment.service";
import { CommentController } from "../controllers/comment.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, BlogPostEntity, CommentEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [],
})
export class CommentModule {}
