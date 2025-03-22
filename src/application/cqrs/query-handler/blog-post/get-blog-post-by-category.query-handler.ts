import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IBlogPostRepository } from '../../../../domain/repositories/blog-post.repository';
import { Inject } from '@nestjs/common';
import { GetBlogPostByCategoryQuery } from '../../query/blog-post/get-blog-post-by-category.query';
import { BlogPostOutputDTO } from 'src/application/dtos/output/blog-post/output-blog-post.dto';
import { BlogPostsWithCount } from 'src/application/dtos/output/return-types/blog-post.return-type';

@QueryHandler(GetBlogPostByCategoryQuery)
export class GetBlogPostByCategoryHandler
  implements IQueryHandler<GetBlogPostByCategoryQuery>
{
  constructor(
    @Inject('IBlogPostRepository')
    private readonly blogPostRepository: IBlogPostRepository,
  ) {}

  async execute(
    query: GetBlogPostByCategoryQuery,
  ): Promise<BlogPostsWithCount> {
    const postsWithPagination = await this.blogPostRepository.getByCategory(
      query.categoryId,
      query.options,
    );

    const outputPosts = postsWithPagination.items.map(
      (post) =>
        new BlogPostOutputDTO(
          post.id.getValue(),
          post.title.getValue(),
          post.content.getValue(),
          post.author.username.getValue(),
          post.categories.map((category) => category.name.getValue()),
          post.status,
        ),
    );
    const postsWithCount = new BlogPostsWithCount(
      outputPosts,
      postsWithPagination.meta.totalItems,
    );

    return postsWithCount;
  }
}
