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
import { DuplicateValueException } from "../../core/exceptions/duplicate-value.exception";
import { UserEntity } from "../../user/entities/user.entity";
import { BlogPostModeEnum } from "src/core/enums/blog-post-mode.enum";
import { GeminiService } from "./gemini.service";

export class BlogPostService {
  constructor(
    @InjectRepository(BlogPostEntity)
    private readonly repository: Repository<BlogPostEntity>,
    private readonly categoryService: CategoryService,
    private readonly geminiService: GeminiService,
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

  async getByCategoryName(categoryName: string): Promise<BlogPostsWithCount> {
    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .innerJoin(
        "blogPost.categories",
        "categories",
        "categories.name = :categoryName",
        { categoryName },
      )
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "allCategories")
      .where("blogPost.mode = :mode", { mode: BlogPostModeEnum.PUBLIC });

    const posts = await queryBuilder.getMany();

    const totalItems = posts.length;

    return new BlogPostsWithCount(
      posts.map((post) => new BlogPostOutputDto(post)),
      totalItems,
    );
  }

  async getByCategoryNameWithPagination(
    categoryName: string,
  ): Promise<BlogPostsWithCount> {
    const page = 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .innerJoin(
        "blogPost.categories",
        "categories",
        "categories.name = :categoryName",
        { categoryName },
      )
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "allCategories")
      .where("blogPost.mode = :mode", { mode: BlogPostModeEnum.PUBLIC })
      .take(limit)
      .skip(skip);

    const [items, total] = await queryBuilder.getManyAndCount();

    return new BlogPostsWithCount(
      items.map((post) => new BlogPostOutputDto(post)),
      total,
    );
  }

  async getByUsername(
    username: string,
    currentUserId: string,
  ): Promise<BlogPostsWithCount> {
    const author: UserEntity = await this.repository.manager
      .getRepository(UserEntity)
      .findOne({
        where: { username },
      });

    const queryBuilder = this.repository
      .createQueryBuilder("blogPost")
      .leftJoinAndSelect("blogPost.author", "author")
      .leftJoinAndSelect("blogPost.categories", "categories")
      .where("author.username = :username", { username });

    if (currentUserId !== author.id) {
      queryBuilder.andWhere("blogPost.mode = :publicMode", {
        publicMode: BlogPostModeEnum.PUBLIC,
      });
    }

    const posts = await queryBuilder.getMany();

    const totalItems = posts.length;

    return new BlogPostsWithCount(
      posts.map((post) => new BlogPostOutputDto(post)),
      totalItems,
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
      .where("blogPost.title = :title", { title })
      .where("blogPost.mode = :mode", { mode: BlogPostModeEnum.PUBLIC });

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
      .where("blogPost.status = :status", { status })
      .where("blogPost.mode = :mode", { mode: BlogPostModeEnum.PUBLIC });

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
        mood: await this.geminiService.detectMood(
          createBlogPostInputDto.content,
        ),
        mode: createBlogPostInputDto.mode,
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
      // await this.emailProvider.sendEmail(
      //   resultedBlogPost.author.email,
      //   "Post Creation",
      //   {
      //     username: resultedBlogPost.author.username,
      //     post_title: resultedBlogPost.title,
      //   },
      //   "post-creation-confirmation/index",
      // );
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
      post.mood = await this.geminiService.detectMood(
        updateBlogPostInputDto.content,
      );
      post.mode = updateBlogPostInputDto.mode;
      console.log("post.mood ", post.mood);

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

  async addLike(id: string): Promise<BlogPostOutputDto> {
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

      entity.likes = entity.likes + 1;

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

  async removeLike(id: string): Promise<BlogPostOutputDto> {
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

      entity.likes = entity.likes > 0 ? entity.likes - 1 : entity.likes;

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
