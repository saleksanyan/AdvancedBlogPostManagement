import { UpdateBlogPostInputDto } from "src/application/dtos/input/blog-post/update-blog-post.dto";

export class UpdateBlogPostCommand {
  constructor(
    public readonly id: string,
    public readonly updateBlogPostInputDto: UpdateBlogPostInputDto,
  ) {}
}
