import {
  Pagination,
  paginate,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { SelectQueryBuilder } from 'typeorm';

export class Paginator {
  static async paginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: IPaginationOptions,
  ): Promise<Pagination<T>> {
    return paginate<T>(queryBuilder, options);
  }
}
