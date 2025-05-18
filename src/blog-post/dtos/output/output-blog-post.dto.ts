import { BlogPostStatusEnum } from "src/core/enums/blog-post.enum";
import { BlogPostEntity } from "src/blog-post/entities/blog-post.entity";
import { MoodEnum } from "src/core/enums/mood.enum";
import { BlogPostModeEnum } from "src/core/enums/blog-post-mode.enum";

export class BlogPostOutputDto {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  status: BlogPostStatusEnum;
  createdAt: Date;
  mood: MoodEnum;
  mode: BlogPostModeEnum;
  likes: number;

  constructor(post: BlogPostEntity) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.author = post.author.username;
    this.categories = post.categories?.map((c) => c.name);
    this.status = post.status;
    this.createdAt = post.created_at;
    this.mood = post.mood;
    this.mode = post.mode;
    this.likes = post.likes;
  }
}
