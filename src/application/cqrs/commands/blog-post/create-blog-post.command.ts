import { CreateBlogPostInputDto } from "src/application/dtos/input/blog-post/create-blog-post.dto";

export class CreateBlogPostCommand {
  constructor(public readonly createBlogPostInputDto: CreateBlogPostInputDto) {}
}
