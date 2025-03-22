import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export class GetCategoryListQuery {
  constructor(public readonly options: IPaginationOptions) {}
}
