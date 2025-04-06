import { CategoryEntity } from "src/category/entities/category.entity";

export class CategoryOutputDto {
  id: string;
  name: string;

  constructor(category: CategoryEntity) {
    this.id = category.id;
    this.name = category.name;
  }
}
