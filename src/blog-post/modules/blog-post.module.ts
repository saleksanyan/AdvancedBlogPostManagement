import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPostController } from "src/blog-post/controllers/blog-post.controller";
import { BlogPostEntity } from "../entities/blog-post.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { UserModule } from "../../user/modules/user.module";
import { CategoryModule } from "../../category/modules/category.module";
import { CommentEntity } from "../../comment/entities/comment.entity";
import { SendGridEmailProvider } from "src/core/email/interfaces/sendgrid-email-provider";
import { UserEntity } from "../../user/entities/user.entity";
import { BlogPostService } from "../services/blog-post.service";
import { SearchController } from "../controllers/search.controller";
import { SearchService } from "../services/search.service";
import { GeminiService } from "../services/gemini.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPostEntity,
      UserEntity,
      CategoryEntity,
      CommentEntity,
    ]),
    UserModule,
    CategoryModule,
  ],
  controllers: [BlogPostController, SearchController],
  providers: [
    BlogPostService,
    SearchService,
    GeminiService,
    {
      provide: "EmailProvider",
      useClass: SendGridEmailProvider,
    },
  ],
  exports: [],
})
export class BlogPostModule {}
