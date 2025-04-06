import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryController } from "../controllers/category.controller";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { CategoryEntity } from "../entities/category.entity";
import { CategoryService } from "src/category/services/category.service";

@Module({
  imports: [TypeOrmModule.forFeature([BlogPostEntity, CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
