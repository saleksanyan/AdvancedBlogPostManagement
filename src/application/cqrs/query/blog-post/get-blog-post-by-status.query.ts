import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { BlogPostStatusEnum } from 'src/domain/enums/blog-post.enum';

export class GetBlogPostByStatusQuery {
  constructor(
    public readonly status: BlogPostStatusEnum,
    public readonly options: IPaginationOptions,
  ) {}
}
