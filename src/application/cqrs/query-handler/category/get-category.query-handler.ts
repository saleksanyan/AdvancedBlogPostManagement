import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCategoryListQuery } from '../../query/category/get-category.query';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryOutputDTO } from 'src/application/dtos/output/category/output-category.dto';
import { CategoriesWithCount } from 'src/application/dtos/output/return-types/category.return-type';

@QueryHandler(GetCategoryListQuery)
export class GetCategoryListHandler
  implements IQueryHandler<GetCategoryListQuery>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoryListQuery): Promise<CategoriesWithCount> {
    const categoriesWithPagination = await this.categoryRepository.getList(
      query.options,
    );
    const categories = categoriesWithPagination.items.map(
      (category) =>
        new CategoryOutputDTO(category.id.getValue(), category.name.getValue()),
    );
    const categoriesWithCount = new CategoriesWithCount(
      categories,
      categoriesWithPagination.meta.totalItems,
    );

    return categoriesWithCount;
  }
}
