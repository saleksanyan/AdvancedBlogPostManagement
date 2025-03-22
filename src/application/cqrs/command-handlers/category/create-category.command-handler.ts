import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCategoryCommand } from '../../commands/category/create-category.command';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryModel } from 'src/domain/models/category.model';
import { CategoryOutputDTO } from 'src/application/dtos/output/category/output-category.dto';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryOutputDTO> {
    const category = new CategoryModel(command.createCategroyInputDto.name);
    const createdCategory = await this.categoryRepository.create(category);

    return new CategoryOutputDTO(
      createdCategory.id.getValue(),
      createdCategory.name.getValue(),
    );
  }
}
