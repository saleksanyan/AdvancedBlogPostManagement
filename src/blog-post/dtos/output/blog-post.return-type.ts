import { BlogPostOutputDto } from "./output-blog-post.dto";

export class BlogPostsWithCount {
  posts: BlogPostOutputDto[];
  total: number;

  constructor(posts: BlogPostOutputDto[], total: number) {
    this.posts = posts;
    this.total = total;
  }
}
