import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { GetCategoryByIdQuery } from '../../query/category/get-category-by-id.query';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CategoryOutputDTO } from 'src/application/dtos/output/category/output-category.dto';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler
  implements IQueryHandler<GetCategoryByIdQuery>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetCategoryByIdQuery): Promise<CategoryOutputDTO> {
    const category = await this.categoryRepository.getById(query.id);
    return new CategoryOutputDTO(
      category.id.getValue(),
      category.name.getValue(),
    );
  }
}
