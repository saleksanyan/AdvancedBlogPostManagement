import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  HttpCode,
  UseFilters,
  Query,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { CreateBlogPostCommand } from 'src/application/cqrs/commands/blog-post/create-blog-post.command';
import { DeleteBlogPostCommand } from 'src/application/cqrs/commands/blog-post/delete-blog-post.command';
import { UpdateBlogPostCommand } from 'src/application/cqrs/commands/blog-post/update-blog-post.command';
import { UpdateStatusCommand } from 'src/application/cqrs/commands/blog-post/update-status.command';
import { GetBlogPostByCategoryQuery } from 'src/application/cqrs/query/blog-post/get-blog-post-by-category.query';
import { GetBlogPostByIdQuery } from 'src/application/cqrs/query/blog-post/get-blog-post-by-id.query';
import { GetBlogPostByStatusQuery } from 'src/application/cqrs/query/blog-post/get-blog-post-by-status.query';
import { GetBlogPostListQuery } from 'src/application/cqrs/query/blog-post/get-blog-post.query';
import { CreateBlogPostInputDto } from 'src/application/dtos/input/blog-post/create-blog-post.dto';
import { UpdateBlogPostInputDto } from 'src/application/dtos/input/blog-post/update-blog-post.dto';
import { UpdateStatusInputDto } from 'src/application/dtos/input/blog-post/update-status.dto';
import { BlogPostOutputDTO } from 'src/application/dtos/output/blog-post/output-blog-post.dto';
import { BlogPostsWithCount } from 'src/application/dtos/output/return-types/blog-post.return-type';
import { HttpExceptionFilter } from 'src/application/exception-filter/http.exception-filter';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/domain/constants/pagination.constant';
import { BlogPostStatusEnum } from 'src/domain/enums/blog-post.enum';

@UseFilters(HttpExceptionFilter)
@Controller('post')
export class BlogPostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('list')
  async getPostList(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_LIMIT,
  ): Promise<BlogPostsWithCount> {
    const options: IPaginationOptions = { page, limit };
    const query = new GetBlogPostListQuery(options);
    return await this.queryBus.execute(query);
  }

  @Get('category/:categoryId')
  async getPostsByCategoryId(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_LIMIT,
    @Param('categoryId') categoryId: string,
  ): Promise<BlogPostsWithCount> {
    const options: IPaginationOptions = { page, limit };
    const query = new GetBlogPostByCategoryQuery(categoryId, options);
    return await this.queryBus.execute(query);
  }

  @Get('status/:status')
  async getPostsByStatus(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_LIMIT,
    @Param('status') status: BlogPostStatusEnum,
  ): Promise<BlogPostsWithCount> {
    const options: IPaginationOptions = { page, limit };
    const query = new GetBlogPostByStatusQuery(status, options);
    return await this.queryBus.execute(query);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<BlogPostOutputDTO> {
    const query = new GetBlogPostByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() body: CreateBlogPostInputDto,
  ): Promise<BlogPostOutputDTO> {
    const command = new CreateBlogPostCommand(body);
    return await this.commandBus.execute(command);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdateBlogPostInputDto,
  ): Promise<BlogPostOutputDTO> {
    const command = new UpdateBlogPostCommand(id, body);

    return await this.commandBus.execute(command);
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusInputDto,
  ): Promise<BlogPostOutputDTO> {
    const command = new UpdateStatusCommand(id, body);

    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    const command = new DeleteBlogPostCommand(id);
    await this.commandBus.execute(command);
  }
}
