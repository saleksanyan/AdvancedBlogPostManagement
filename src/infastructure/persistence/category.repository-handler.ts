import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Paginator } from './paginator';
import { CategoryModel } from '../../domain/models/category.model';
import { CategoryMapper } from '../mappers/category/category.mapper';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryNotFoundException } from 'src/application/exceptions/category-not-found.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { DuplicateValueException } from 'src/application/exceptions/duplicate-value.exception';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepositoryHandler implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async create(category: CategoryModel): Promise<CategoryModel> {
    const categoryWithDublicateName = await this.repository.findOne({
      where: { name: category.name.getValue() },
    });

    if (categoryWithDublicateName) {
      throw new DuplicateValueException(
        `Category with name '${category.name.getValue()}' already exists`,
      );
    }

    const entity = this.repository.create({
      name: category.name.getValue(),
    });
    const savedEntity = await this.repository.save(entity);

    return CategoryMapper.toModel(savedEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new CategoryNotFoundException(`Category with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<CategoryModel> {
    const entity = await this.repository.findOne({ where: { id: id } });
    if (!entity) {
      throw new CategoryNotFoundException(`Category with ID ${id} not found`);
    }

    return CategoryMapper.toModel(entity);
  }

  async getList(
    options: IPaginationOptions,
  ): Promise<Pagination<CategoryModel>> {
    const queryBuilder = this.repository.createQueryBuilder('category');
    const paginatedResult = await Paginator.paginate<CategoryEntity>(
      queryBuilder,
      options,
    );

    return new Pagination<CategoryModel>(
      paginatedResult.items.map((entity) => CategoryMapper.toModel(entity)),
      paginatedResult.meta,
      paginatedResult.links,
    );
  }

  async findByIds(categoryIds: string[]): Promise<CategoryModel[]> {
    const categories: CategoryModel[] = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await this.repository.findOne({
          where: { id: categoryId },
        });

        if (!category) {
          throw new CategoryNotFoundException(
            `Category with ID ${categoryId} not found`,
          );
        }

        return CategoryMapper.toModel(category);
      }),
    );
    return categories;
  }
}
