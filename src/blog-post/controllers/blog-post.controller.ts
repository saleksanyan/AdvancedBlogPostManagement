import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  UseFilters,
  Query,
  Patch,
  Req,
} from "@nestjs/common";
import { CreateBlogPostInputDto } from "src/blog-post/dtos/input/create-blog-post.dto";
import { UpdateBlogPostInputDto } from "src/blog-post/dtos/input/update-blog-post.dto";
import { UpdateStatusInputDto } from "src/blog-post/dtos/input/update-status.dto";
import { CreateCommentInputDto } from "src/comment/dtos/input/create-comment.dto";
import { BlogPostOutputDto } from "src/blog-post/dtos/output/output-blog-post.dto";
import { BlogPostsWithCount } from "src/blog-post/dtos/output/blog-post.return-type";
import { HttpExceptionFilter } from "src/core/exception-filter/http.exception-filter";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import { BlogPostService } from "src/blog-post/services/blog-post.service";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from "src/core/constants/pagination.constant";
import { BlogPostStatusEnum } from "src/core/enums/blog-post.enum";

@UseFilters(HttpExceptionFilter)
@Controller("post")
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @HttpCode(201)
  @Get("list")
  async getPostList(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
  ): Promise<BlogPostsWithCount> {
    return await this.blogPostService.list(page, limit);
  }

  @HttpCode(200)
  @Get("category/:categoryName")
  async getPostsByCategoryName(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Param("categoryName") categoryName: string,
  ): Promise<BlogPostsWithCount> {
    categoryName = categoryName.replaceAll('-', ' ');

    return await this.blogPostService.getByCategoryName(
      page,
      limit,
      categoryName,
    );
  }

  @HttpCode(200)
  @Get()
  async getPostsByName(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Query("title") title: string,
  ): Promise<BlogPostsWithCount> {
    title = title.replaceAll('-', ' ');

    return await this.blogPostService.getByTitle(
      page,
      limit,
      title,
    );
  }

  @HttpCode(200)
  @Get("user/:username")
  async getPostsByUserIde(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Param("username") username: string,
  ): Promise<BlogPostsWithCount> {
    return await this.blogPostService.getByUsername(
      page,
      limit,
      username,
    );
  }

  @HttpCode(200)
  @Get("status/:status")
  async getPostsByStatus(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Param("status") status: BlogPostStatusEnum,
  ): Promise<BlogPostsWithCount> {
    return await this.blogPostService.getByStatus(page, limit, status);
  }

  @HttpCode(200)
  @Get(":id")
  async getPostById(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.getById(id);
  }

  @Post()
  @HttpCode(201)
  async createPost(
    @Req() req: Request,
    @Body() body: CreateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    const userId = (req as any).user;

    return await this.blogPostService.create(userId, body);
  }

  @HttpCode(204)
  @Put(":id")
  async updatePost(
    @Param("id", CheckUUIDPipe) id: string,
    @Body() body: UpdateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.update(id, body);
  }

  @HttpCode(200)
  @Patch(":id")
  async updateStatus(
    @Param("id", CheckUUIDPipe) id: string,
    @Body() body: UpdateStatusInputDto,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.updateStatus(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async deletePost(@Param("id", CheckUUIDPipe) id: string): Promise<void> {
    await this.blogPostService.delete(id);
  }

  @HttpCode(201)
  @Post("/comment")
  async addComment(comment: CreateCommentInputDto) {}
}
