import { BlogPostOutputDTO } from '../blog-post/output-blog-post.dto';

export class BlogPostsWithCount {
  posts: BlogPostOutputDTO[];
  total: number;

  constructor(posts: BlogPostOutputDTO[], total: number) {
    this.posts = posts;
    this.total = total;
  }
}
