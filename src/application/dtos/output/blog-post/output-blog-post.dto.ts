import { BlogPostStatusEnum } from 'src/domain/enums/blog-post.enum';

export class BlogPostOutputDTO {
  private id: string;
  private title: string;
  private content: string;
  private author: string;
  private categories: string[];
  private status: BlogPostStatusEnum;

  constructor(
    id: string,
    title: string,
    content: string,
    author: string,
    categories: string[],
    status: BlogPostStatusEnum,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.categories = categories;
    this.status = status;
  }
}
