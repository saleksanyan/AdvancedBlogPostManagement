import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlogPostEntity } from "../entities/blog-post.entity";
import { BlogPostsWithCount } from "../dtos/output/blog-post.return-type";
import { BlogPostOutputDto } from "../dtos/output/output-blog-post.dto";
import { BlogPostModeEnum } from "src/core/enums/blog-post-mode.enum";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly repository: Repository<BlogPostEntity>,
  ) {}

  async searchPosts(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<BlogPostsWithCount> {
    try {
      if (!query) {
        return new BlogPostsWithCount([], 0);
      }

      const [items, totalItems] = await this.repository
        .createQueryBuilder("blog_post")
        .leftJoinAndSelect("blog_post.categories", "category")
        .leftJoinAndSelect("blog_post.author", "author")
        .where("blogPost.mode = :mode", { mode: BlogPostModeEnum.PUBLIC })
        .where("LOWER(blog_post.title) LIKE LOWER(:query)", {
          query: `%${query}%`,
        })
        .orWhere("LOWER(category.name) LIKE LOWER(:query)", {
          query: `%${query}%`,
        })
        .orWhere("LOWER(author.username) LIKE LOWER(:query)", {
          query: `%${query}%`,
        })
        .orderBy("blog_post.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return new BlogPostsWithCount(
        items.map((post) => new BlogPostOutputDto(post)),
        totalItems,
      );
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}
