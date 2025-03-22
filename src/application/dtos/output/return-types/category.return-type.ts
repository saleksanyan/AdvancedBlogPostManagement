import { CategoryOutputDTO } from '../category/output-category.dto';

export class CategoriesWithCount {
  categories: CategoryOutputDTO[];
  total: number;

  constructor(posts: CategoryOutputDTO[], total: number) {
    this.categories = posts;
    this.total = total;
  }
}
