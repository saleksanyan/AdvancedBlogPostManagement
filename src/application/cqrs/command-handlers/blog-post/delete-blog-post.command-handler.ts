import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IBlogPostRepository } from '../../../../domain/repositories/blog-post.repository';
import { DeleteBlogPostCommand } from '../../commands/blog-post/delete-blog-post.command';
import { Inject } from '@nestjs/common';

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostHandler
  implements ICommandHandler<DeleteBlogPostCommand>
{
  constructor(
    @Inject('IBlogPostRepository')
    private readonly blogPostRepository: IBlogPostRepository,
  ) {}

  async execute(command: DeleteBlogPostCommand): Promise<void> {
    await this.blogPostRepository.delete(command.id);
  }
}
