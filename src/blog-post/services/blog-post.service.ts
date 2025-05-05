import { BlogPostStatusEnum } from "src/core/enums/blog-post.enum";
import { CreateBlogPostInputDto } from "../dtos/input/create-blog-post.dto";
import { UpdateBlogPostInputDto } from "../dtos/input/update-blog-post.dto";
import { UpdateStatusInputDto } from "../dtos/input/update-status.dto";
import { BlogPostOutputDto } from "../dtos/output/output-blog-post.dto";
import { BlogPostsWithCount } from "../dtos/output/blog-post.return-type";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogPostEntity } from "../entities/blog-post.entity";
import { Repository } from "typeorm";
import { Paginator } from "src/core/paginator/paginator";
import { BlogPostNotFoundException } from "../../core/exceptions/blog-post-not-found.exception";
import { CategoryService } from "../../category/services/category.service";
import { Inject } from "@nestjs/common";
import { EmailProvider } from "../../core/email/interfaces/email-provider.interface";
import { UserNotFoundException } from "../../core/exceptions/user-not-found.exception";
import { DuplicateValueException } from "src/core/exceptions/duplicate-value.exception";
import { UserEntity } from "src/user/entities/user.entity";

export class BlogPostService {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly repository: Repository<BlogPostEntity>,
    private readonly categoryService: CategoryService,
    @Inject("EmailProvider")
    private readonly emailProvider: EmailProvider,
  ) {}

  async list(page: number, limit: number): Promise<BlogPostsWithCount> {
    const options = { page, limit };
    const queryBuilder = this.repository.createQueryBuilder("blogPost");
    queryBuilder
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "categories");

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    return new BlogPostsWithCount(
      paginatedResult.items.map((post) => new BlogPostOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }

  async getByCategoryName(
    page: number,
    limit: number,
    categoryName: string,
  ): Promise<BlogPostsWithCount> {
    const options = { page, limit };

    const queryBuilder = this.repository
    .createQueryBuilder("blogPost")
    .innerJoin("blogPost.categories", "categories", "categories.name = :categoryName", { categoryName })
    .leftJoinAndSelect("blogPost.author", "author")
    .leftJoinAndSelect("blogPost.categories", "allCategories");
  
    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );    

    return new BlogPostsWithCount(
      paginatedResult.items.map((post) => new BlogPostOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }

  async getByUsername(
    page: number,
    limit: number,
    username: string,
  ): Promise<BlogPostsWithCount> {
    const options = { page, limit };

    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "categories")
      .where("author.username = :username", { username });

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    return new BlogPostsWithCount(
      paginatedResult.items.map((post) => new BlogPostOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }


  async getByTitle(
    page: number,
    limit: number,
    title: string,
  ): Promise<BlogPostsWithCount> {
    const options = { page, limit };
    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "categories")
      .where("blogPost.title = :title", { title });

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    return new BlogPostsWithCount(
      paginatedResult.items.map((post) => new BlogPostOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }

  async getByStatus(
    page: number,
    limit: number,
    status: BlogPostStatusEnum,
  ): Promise<BlogPostsWithCount> {
    const options = { page, limit };
    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "categories")
      .where("blogPost.status = :status", { status });

    const paginatedResult = await Paginator.paginate<BlogPostEntity>(
      queryBuilder,
      options,
    );

    return new BlogPostsWithCount(
      paginatedResult.items.map((post) => new BlogPostOutputDto(post)),
      paginatedResult.meta.totalItems,
    );
  }

  async getById(id: string): Promise<BlogPostOutputDto> {
    const entity = await this.repository.findOne({
      where: { id: id },
      relations: ["author", "categories"],
    });

    if (!entity) {
      throw new BlogPostNotFoundException();
    }
console.log(entity);

    return new BlogPostOutputDto(entity);
  }

  async create(
    authorId: string,
    createBlogPostInputDto: CreateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const postWithDublicateTitle = await this.repository.findOne({
        where: { title: createBlogPostInputDto.title },
      });

      if (postWithDublicateTitle) {
        throw new DuplicateValueException(
          `Post with title '${createBlogPostInputDto.title}' already exists`,
        );
      }

      const author = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { id: authorId },
        });

      const categories = await this.categoryService.findByNames(
        createBlogPostInputDto.categories,
      );

      const entity = queryRunner.manager.getRepository(BlogPostEntity).create({
        author: author,
        title: createBlogPostInputDto.title,
        content: createBlogPostInputDto.content,
        categories: categories,
        mood: createBlogPostInputDto.mood
      });

      const savedEntity = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .save(entity);

      const resultedBlogPost = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .findOne({
          where: { id: savedEntity.id },
          relations: ["author", "categories"],
        });

      await queryRunner.commitTransaction();
      await this.emailProvider.sendEmail(
        resultedBlogPost.author.email,
        "Post Creation",
        {
          username: resultedBlogPost.author.username,
          post_title: resultedBlogPost.title,
        },
        "post-creation-confirmation/index",
      );
      return new BlogPostOutputDto(resultedBlogPost);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateBlogPostInputDto: UpdateBlogPostInputDto,
  ): Promise<BlogPostOutputDto> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.commitTransaction();
      const post = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .findOne({
          where: { id },
          relations: ["author", "categories"],
        });
      if (!post) {
        throw new BlogPostNotFoundException();
      }

      if (post.status == BlogPostStatusEnum.INACTIVE) {
        throw new BlogPostNotFoundException();
      }
      if (updateBlogPostInputDto.authorId != post.author.id) {
        throw new UserNotFoundException();
      }

      post.content = updateBlogPostInputDto.content;
      post.title = updateBlogPostInputDto.title;
      post.mood = updateBlogPostInputDto.mood; 

      const updatedPost = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .save(post);

      await queryRunner.commitTransaction();

      return new BlogPostOutputDto(updatedPost);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(
    id: string,
    updateStatusInputDto: UpdateStatusInputDto,
  ): Promise<BlogPostOutputDto> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const entity = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .findOne({
          where: { id: id },
          relations: ["author", "categories"],
        });

      if (!entity) {
        throw new BlogPostNotFoundException();
      }

      entity.status = updateStatusInputDto.status;

      const updatedEntity = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .save(entity);

      await queryRunner.commitTransaction();

      return new BlogPostOutputDto(updatedEntity);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager
        .getRepository(BlogPostEntity)
        .delete(id);

      if (result.affected === 0) {
        throw new BlogPostNotFoundException();
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
