import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepositoryHandler } from '../persistence/category.repository-handler';
import { CreateCategoryHandler } from '../../application/cqrs/command-handlers/category/create-category.command-handler';
import { GetCategoryByIdHandler } from '../../application/cqrs/query-handler/category/get-category-by-id.query-handler';
import { GetCategoryListHandler } from '../../application/cqrs/query-handler/category/get-category.query-handler';
import { DeleteCategoryHandler } from '../../application/cqrs/command-handlers/category/delete-category.command-handler';
import { CategoryController } from '../../presentation/controllers/category.controller';
import { BlogPostEntity } from '../entities/blog-post.entity';
import { CategoryEntity } from '../entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPostEntity, CategoryEntity]),
    CqrsModule,
  ],
  controllers: [CategoryController],
  providers: [
    CreateCategoryHandler,
    GetCategoryByIdHandler,
    GetCategoryListHandler,
    DeleteCategoryHandler,
    CategoryRepositoryHandler,
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepositoryHandler,
    },
  ],
  exports: [],
})
export class CategoryModule {}
