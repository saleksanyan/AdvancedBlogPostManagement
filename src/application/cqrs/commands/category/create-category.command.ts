import { CreateCategoryInputDto } from "src/application/dtos/input/category/create-category.dto";

export class CreateCategoryCommand {
  constructor(public readonly createCategroyInputDto: CreateCategoryInputDto) {}
}
