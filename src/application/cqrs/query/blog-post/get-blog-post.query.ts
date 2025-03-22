import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export class GetBlogPostListQuery {
  constructor(public readonly options: IPaginationOptions) {}
}
