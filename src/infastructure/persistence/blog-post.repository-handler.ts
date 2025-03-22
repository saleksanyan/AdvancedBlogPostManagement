import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { BlogPostMapper } from '../mappers/blog-post/blog-post.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPostNotFoundException } from 'src/application/exceptions/blog-post-not-found.exception';
import { BlogPostModel } from 'src/domain/models/blog-post.model';
import { IBlogPostRepository } from 'src/domain/repositories/blog-post.repository';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Paginator } from './paginator';
import { UserMapper } from '../mappers/user/user.mapper';
import { CategoryMapper } from '../mappers/category/category.mapper';
import { BlogPostStatusEnum } from 'src/domain/enums/blog-post.enum';
import { UpdateStatusInputDto } from '../../application/dtos/input/blog-post/update-status.dto';
import { BlogPostEntity } from '../entities/blog-post.entity';

@Injectable()
export class BlogPostRepositoryHandler implements IBlogPostRepository {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly repository: Repository<BlogPostEntity>,
  ) {}

  async create(post: BlogPostModel): Promise<BlogPostModel> {
    const entity = this.repository.create({
      author: UserMapper.toEntity(post.author),
      title: post.title.getValue(),
      content: post.content.getValue(),
      categories: post.categories.map((category) =>
        CategoryMapper.toEntity(category),
      ),
    });
    const savedEntity = await this.repository.save(entity);

    const resultedBlogPost = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['author', 'categories'],
    });

    return BlogPostMapper.toModel(resultedBlogPost);
  }

  async update(post: BlogPostModel): Promise<BlogPostModel> {
    const entity = BlogPostMapper.toEntity(post);
    const updatedEntity = await this.repository.save(entity);

    // if(blo)

    return BlogPostMapper.toModel(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new BlogPostNotFoundException(
        `No blog post was found with ID ${id}`,
      );
    }
  }

  async getById(id: string): Promise<BlogPostModel> {
    const entity = await this.repository.findOne({
      where: { id: id },
      relations: ['author', 'categories'],
    });
    if (!entity) {
      throw new BlogPostNotFoundException(
        `No blog post was found with ID ${id}`,
      );
    }

    return BlogPostMapper.toModel(entity);
  }

  async getByCategory(
    categoryId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<BlogPostModel>> {
    const queryBuilder = this.repository
      .createQueryBuilder('blogPost')
      .leftJoinAndSelect('blogPost.author', 'author')
      .leftJoinAndSelect('blogPost.categories', 'categories')
      .where('categories.id = :categoryId', { categoryId });

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    if (!paginatedResult.items.length) {
      throw new BlogPostNotFoundException(
        `No blog posts found for category ID ${categoryId}`,
      );
    }

    return new Pagination<BlogPostModel>(
      paginatedResult.items.map((entity) => BlogPostMapper.toModel(entity)),
      paginatedResult.meta,
      paginatedResult.links,
    );
  }

  async getByStatus(
    status: BlogPostStatusEnum,
    options: IPaginationOptions,
  ): Promise<Pagination<BlogPostModel>> {
    const queryBuilder = this.repository
      .createQueryBuilder('blogPost')
      .leftJoinAndSelect('blogPost.author', 'author')
      .leftJoinAndSelect('blogPost.categories', 'categories')
      .where('blogPost.status = :status', { status });

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    if (!paginatedResult.items.length) {
      throw new BlogPostNotFoundException(
        `No blog posts found with status ${status}`,
      );
    }

    return new Pagination<BlogPostModel>(
      paginatedResult.items.map((entity) => BlogPostMapper.toModel(entity)),
      paginatedResult.meta,
      paginatedResult.links,
    );
  }

  async getList(
    options: IPaginationOptions,
  ): Promise<Pagination<BlogPostModel>> {
    const queryBuilder = this.repository.createQueryBuilder('blogPost');
    queryBuilder
      .leftJoinAndSelect('blogPost.author', 'author')
      .leftJoinAndSelect('blogPost.categories', 'categories');

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    if (!paginatedResult.items.length) {
      throw new BlogPostNotFoundException(`No blog posts found`);
    }

    return new Pagination<BlogPostModel>(
      paginatedResult.items.map((entity) => BlogPostMapper.toModel(entity)),
      paginatedResult.meta,
      paginatedResult.links,
    );
  }

  async updateStatus(
    id: string,
    updateStatusInputDto: UpdateStatusInputDto,
  ): Promise<BlogPostModel> {
    const entity = await this.repository.findOne({
      where: { id: id },
      relations: ['author', 'categories'],
    });
    if (!entity) {
      throw new BlogPostNotFoundException(
        `No blog post was found with ID ${id}`,
      );
    }

    entity.status = updateStatusInputDto.status;
    const updatedEntity = await this.repository.save(entity);

    return BlogPostMapper.toModel(updatedEntity);
  }
}
