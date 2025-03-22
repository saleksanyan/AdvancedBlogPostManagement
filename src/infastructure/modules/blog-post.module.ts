import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryHandler } from '../persistence/user.repository-handler';
import { CreateBlogPostHandler } from 'src/application/cqrs/command-handlers/blog-post/create-blog-post.command-handler';
import { DeleteBlogPostHandler } from 'src/application/cqrs/command-handlers/blog-post/delete-blog-post.command-handler';
import { UpdateBlogPostHandler } from 'src/application/cqrs/command-handlers/blog-post/update-blog-post.command-handler';
import { GetBlogPostByIdHandler } from 'src/application/cqrs/query-handler/blog-post/get-blog-post-by-id.query-handler';
import { GetBlogPostListHandler } from 'src/application/cqrs/query-handler/blog-post/get-blog-post.query-handler';
import { BlogPostController } from 'src/presentation/controllers/blog-post.controller';
import { BlogPostRepositoryHandler } from '../persistence/blog-post.repository-handler';
import { CategoryRepositoryHandler } from '../persistence/category.repository-handler';
import { GetBlogPostByStatusHandler } from 'src/application/cqrs/query-handler/blog-post/get-blog-post-by-status.query-handler';
import { GetBlogPostByCategoryHandler } from 'src/application/cqrs/query-handler/blog-post/get-blog-post-by-category.query-handler';
import { UpdateStatusHandler } from 'src/application/cqrs/command-handlers/blog-post/update-status.command-handler';
import { MailerService } from 'src/application/services/email.service';
import { BlogPostEntity } from '../entities/blog-post.entity';
import { CategoryEntity } from '../entities/category.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPostEntity, UserEntity, CategoryEntity]),
    CqrsModule,
  ],
  controllers: [BlogPostController],
  providers: [
    CreateBlogPostHandler,
    UpdateBlogPostHandler,
    DeleteBlogPostHandler,
    GetBlogPostByIdHandler,
    GetBlogPostListHandler,
    GetBlogPostByStatusHandler,
    GetBlogPostByCategoryHandler,
    UpdateStatusHandler,
    BlogPostRepositoryHandler,
    MailerService,
    {
      provide: 'IBlogPostRepository',
      useClass: BlogPostRepositoryHandler,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryHandler,
    },
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepositoryHandler,
    },
  ],
  exports: [],
})
export class BlogPostModule {}
