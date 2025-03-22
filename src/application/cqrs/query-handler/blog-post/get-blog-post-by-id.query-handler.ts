import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IBlogPostRepository } from '../../../../domain/repositories/blog-post.repository';
import { GetBlogPostByIdQuery } from '../../query/blog-post/get-blog-post-by-id.query';
import { Inject } from '@nestjs/common';
import { BlogPostOutputDTO } from 'src/application/dtos/output/blog-post/output-blog-post.dto';

@QueryHandler(GetBlogPostByIdQuery)
export class GetBlogPostByIdHandler
  implements IQueryHandler<GetBlogPostByIdQuery>
{
  constructor(
    @Inject('IBlogPostRepository')
    private readonly blogPostRepository: IBlogPostRepository,
  ) {}

  async execute(query: GetBlogPostByIdQuery): Promise<BlogPostOutputDTO> {
    const post = await this.blogPostRepository.getById(query.id);

    return new BlogPostOutputDTO(
      post.id.getValue(),
      post.title.getValue(),
      post.content.getValue(),
      post.author.username.getValue(),
      post.categories.map((category) => category.name.getValue()),
      post.status,
    );
  }
}
