import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CategoryModel } from '../models/category.model';

export interface ICategoryRepository {
  create(post: CategoryModel): Promise<CategoryModel>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<CategoryModel>;
  getList(options: IPaginationOptions): Promise<Pagination<CategoryModel>>;
  findByIds(ids: string[]): Promise<CategoryModel[]>;
}
