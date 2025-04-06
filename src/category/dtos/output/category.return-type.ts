import { CategoryOutputDto } from "./output-category.dto";

export class CategoriesWithCount {
  categories: CategoryOutputDto[];
  total: number;

  constructor(posts: CategoryOutputDto[], total: number) {
    this.categories = posts;
    this.total = total;
  }
}
