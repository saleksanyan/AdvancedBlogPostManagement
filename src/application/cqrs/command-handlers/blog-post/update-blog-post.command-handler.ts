import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IBlogPostRepository } from '../../../../domain/repositories/blog-post.repository';
import { UpdateBlogPostCommand } from '../../commands/blog-post/update-blog-post.command';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from 'src/application/exceptions/user-not-found.exception';
import { BlogPostStatusEnum } from 'src/domain/enums/blog-post.enum';
import { BlogPostNotFoundException } from 'src/application/exceptions/blog-post-not-found.exception';
import { BlogPostOutputDTO } from 'src/application/dtos/output/blog-post/output-blog-post.dto';

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostHandler
  implements ICommandHandler<UpdateBlogPostCommand>
{
  constructor(
    @Inject('IBlogPostRepository')
    private readonly blogPostRepository: IBlogPostRepository,
  ) {}

  async execute(command: UpdateBlogPostCommand): Promise<BlogPostOutputDTO> {
    const post = await this.blogPostRepository.getById(command.id);

    if (post.status == BlogPostStatusEnum.INACTIVE) {
      throw new BlogPostNotFoundException();
    }
    if (command.updateBlogPostInputDto.authorId != post.author.id.getValue()) {
      throw new UserNotFoundException();
    }

    post.content = command.updateBlogPostInputDto.content;
    post.title = command.updateBlogPostInputDto.title;

    const updatedPost = await this.blogPostRepository.update(post);

    return new BlogPostOutputDTO(
      updatedPost.id.getValue(),
      updatedPost.title.getValue(),
      updatedPost.content.getValue(),
      updatedPost.author.username.getValue(),
      updatedPost.categories.map((category) => category.name.getValue()),
      updatedPost.status,
    );
  }
}
