import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogPostModel } from '../../../../domain/models/blog-post.model';
import { IBlogPostRepository } from '../../../../domain/repositories/blog-post.repository';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { CreateBlogPostCommand } from '../../commands/blog-post/create-blog-post.command';
import { Inject } from '@nestjs/common';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { MailerService } from 'src/application/services/email.service';
import { BlogPostOutputDTO } from 'src/application/dtos/output/blog-post/output-blog-post.dto';

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostHandler
  implements ICommandHandler<CreateBlogPostCommand>
{
  constructor(
    @Inject('IBlogPostRepository')
    private readonly blogPostRepository: IBlogPostRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    private readonly emailService: MailerService,
  ) {}

  async execute(command: CreateBlogPostCommand): Promise<BlogPostOutputDTO> {
    const author = await this.userRepository.getById(
      command.createBlogPostInputDto.authorId,
    );

    const categories = await this.categoryRepository.findByIds(
      command.createBlogPostInputDto.categories,
    );

    const post = new BlogPostModel(
      command.createBlogPostInputDto.title,
      command.createBlogPostInputDto.content,
      author,
      categories,
    );
    const createdPost = await this.blogPostRepository.create(post);

    const authorEmail = post.author.mail.getValue();
    await this.emailService.sendEmail(
      authorEmail,
      'New Blog Post Created',
      `Hi ${post.author.username.getValue()}, \nYour new blog post "${post.title.getValue()}" has been successfully created!`
    );

    return new BlogPostOutputDTO(
      createdPost.id.getValue(),
      createdPost.title.getValue(),
      createdPost.content.getValue(),
      createdPost.author.username.getValue(),
      createdPost.categories.map((category) => category.name.getValue()),
      createdPost.status,
    );
  }
}
