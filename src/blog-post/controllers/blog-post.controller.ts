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
import { ApiOperation, ApiTags, ApiQuery, ApiParam } from "@nestjs/swagger";
import { CreateBlogPostInputDto } from "src/blog-post/dtos/input/create-blog-post.dto";
import { UpdateBlogPostInputDto } from "src/blog-post/dtos/input/update-blog-post.dto";
import { UpdateStatusInputDto } from "src/blog-post/dtos/input/update-status.dto";
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
import { GeminiService } from "../services/gemini.service";
import { EditPostContentInputDto } from "../dtos/input/edit-post-content.dto";

@ApiTags("Blog Posts")
@UseFilters(HttpExceptionFilter)
@Controller("post")
export class BlogPostController {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly geminiService: GeminiService,
  ) {}

  @ApiOperation({
    summary: "Get blog posts list",
    description: "Returns paginated list of blog posts.",
  })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @HttpCode(201)
  @Get("list")
  async getPostList(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
  ): Promise<BlogPostsWithCount> {
    return await this.blogPostService.list(page, limit);
  }

  @ApiOperation({
    summary: "Edit post text",
    description: "Uses Gemini AI to enhance blog post content.",
  })
  @HttpCode(200)
  @Post("edit-text")
  async editText(@Body() body: EditPostContentInputDto) {
    return await this.geminiService.enhanceText(body.content, body.makeFancy);
  }

  @ApiOperation({ summary: "Get posts by category with pagination" })
  @ApiParam({ name: "categoryName", description: "Name of the category" })
  @HttpCode(200)
  @Get("category/:categoryName/with-pages")
  async getPostsByCategoryNameWithPagination(
    @Param("categoryName") categoryName: string,
  ): Promise<BlogPostsWithCount> {
    categoryName = categoryName.replaceAll("-", " ");
    return await this.blogPostService.getByCategoryNameWithPagination(
      categoryName,
    );
  }

  @ApiOperation({ summary: "Get all posts by category" })
  @ApiParam({ name: "categoryName", description: "Name of the category" })
  @HttpCode(200)
  @Get("category/:categoryName")
  async getPostsByCategoryName(
    @Param("categoryName") categoryName: string,
  ): Promise<BlogPostsWithCount> {
    categoryName = categoryName.replaceAll("-", " ");
    return await this.blogPostService.getByCategoryName(categoryName);
  }

  @ApiOperation({ summary: "Search posts by title" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "title", required: true })
  @HttpCode(200)
  @Get()
  async getPostsByName(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Query("title") title: string,
  ): Promise<BlogPostsWithCount> {
    title = title.replaceAll("-", " ");
    return await this.blogPostService.getByTitle(page, limit, title);
  }

  @ApiOperation({ summary: "Get posts by username" })
  @ApiParam({ name: "username", description: "Username of the author" })
  @HttpCode(200)
  @Get("user/:username")
  async getPostsByUserIde(
    @Param("username") username: string,
    @Req() req: Request,
  ): Promise<BlogPostsWithCount> {
    const userId = (req as any).user;
    return await this.blogPostService.getByUsername(username, userId);
  }

  @ApiOperation({ summary: "Get posts by status" })
  @ApiParam({ name: "status", enum: BlogPostStatusEnum })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @HttpCode(200)
  @Get("status/:status")
  async getPostsByStatus(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
    @Param("status") status: BlogPostStatusEnum,
  ): Promise<BlogPostsWithCount> {
    return await this.blogPostService.getByStatus(page, limit, status);
  }

  @ApiOperation({ summary: "Get post by ID" })
  @ApiParam({ name: "id", description: "UUID of the post" })
  @HttpCode(200)
  @Get(":id")
  async getPostById(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.getById(id);
  }

  @ApiOperation({ summary: "Create a new blog post" })
  @HttpCode(201)
  @Post()
  async createPost(
    @Req() req: Request,
    @Body() body: CreateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    const userId = (req as any).user;
    return await this.blogPostService.create(userId, body);
  }

  @ApiOperation({ summary: "Update a blog post" })
  @ApiParam({ name: "id", description: "UUID of the post to update" })
  @HttpCode(200)
  @Put(":id")
  async updatePost(
    @Param("id", CheckUUIDPipe) id: string,
    @Body() body: UpdateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.update(id, body);
  }

  @ApiOperation({ summary: "Add a like to a blog post" })
  @HttpCode(200)
  @Patch("add-like/:id")
  async addLike(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<BlogPostOutputDto> {
    return this.blogPostService.addLike(id);
  }

  @ApiOperation({ summary: "Add a like to a blog post" })
  @HttpCode(200)
  @Patch("remove-like/:id")
  async removeLike(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<BlogPostOutputDto> {
    return this.blogPostService.removeLike(id);
  }

  @ApiOperation({ summary: "Update the status of a blog post" })
  @ApiParam({ name: "id", description: "UUID of the post" })
  @HttpCode(200)
  @Patch(":id")
  async updateStatus(
    @Param("id", CheckUUIDPipe) id: string,
    @Body() body: UpdateStatusInputDto,
  ): Promise<BlogPostOutputDto> {
    return await this.blogPostService.updateStatus(id, body);
  }

  @ApiOperation({ summary: "Delete a blog post" })
  @ApiParam({ name: "id", description: "UUID of the post to delete" })
  @HttpCode(204)
  @Delete(":id")
  async deletePost(@Param("id", CheckUUIDPipe) id: string): Promise<void> {
    await this.blogPostService.delete(id);
  }
}
