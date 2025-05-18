import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "src/category/entities/category.entity";
import { Repository } from "typeorm";
import { CreateCategoryInputDto } from "../dtos/input/create-category.dto";
import { CategoryOutputDto } from "../dtos/output/output-category.dto";
import { Paginator } from "src/core/paginator/paginator";
import { CategoryNotFoundException } from "../../core/exceptions/category-not-found.exception";
import { DuplicateValueException } from "../../core/exceptions/duplicate-value.exception";
import { CategoriesWithCount } from "../dtos/output/category.return-type";

export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async list(): Promise<CategoriesWithCount> {
    const queryBuilder = this.repository.manager
      .getRepository(CategoryEntity)
      .createQueryBuilder("category");
    const categories = await queryBuilder.getMany();

    const totalItems = categories.length;

    return new CategoriesWithCount(
      categories.map((category) => new CategoryOutputDto(category)),
      totalItems,
    );
  }

  async getById(id: string): Promise<CategoryOutputDto> {
    const entity = await this.repository.findOne({ where: { id: id } });
    if (!entity) {
      throw new CategoryNotFoundException();
    }
    return new CategoryOutputDto(entity);
  }

  async create(
    createCategoryInputDto: CreateCategoryInputDto,
  ): Promise<CategoryOutputDto> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const categoryWithDublicateName = await queryRunner.manager
        .getRepository(CategoryEntity)
        .findOne({
          where: { name: createCategoryInputDto.name },
        });

      if (categoryWithDublicateName) {
        throw new DuplicateValueException(
          `Category with name '${createCategoryInputDto.name}' already exists`,
        );
      }

      const entity = queryRunner.manager.getRepository(CategoryEntity).create({
        name: createCategoryInputDto.name,
      });
      const savedEntity = await queryRunner.manager
        .getRepository(CategoryEntity)
        .save(entity);

      await queryRunner.commitTransaction();

      return new CategoryOutputDto(savedEntity);
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
        .getRepository(CategoryEntity)
        .delete(id);
      if (result.affected === 0) {
        throw new CategoryNotFoundException();
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByIds(categoryIds: string[]): Promise<CategoryEntity[]> {
    const categories: CategoryEntity[] = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await this.repository.findOne({
          where: { id: categoryId },
        });

        if (!category) {
          throw new CategoryNotFoundException();
        }

        return category;
      }),
    );
    return categories;
  }

  async findByNames(categoryNames: string[]): Promise<CategoryEntity[]> {
    const categories: CategoryEntity[] = await Promise.all(
      categoryNames.map(async (categoryName) => {
        let category = await this.repository.findOne({
          where: { name: categoryName },
        });

        if (!category) {
          await this.create({ name: categoryName });
          category = await this.repository.findOne({
            where: { name: categoryName },
          });
        }

        return category;
      }),
    );
    return categories;
  }
}
