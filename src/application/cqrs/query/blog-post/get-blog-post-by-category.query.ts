import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export class GetBlogPostByCategoryQuery {
  constructor(
    public readonly categoryId: string,
    public readonly options: IPaginationOptions,
  ) {}
}
