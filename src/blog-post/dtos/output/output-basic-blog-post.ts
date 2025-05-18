import { MoodEnum } from "src/core/enums/mood.enum";
import { BlogPostEntity } from "../../../blog-post/entities/blog-post.entity";
import { BlogPostModeEnum } from "src/core/enums/blog-post-mode.enum";

export class BasicBlogPostOutputDto {
  id: string;
  title: string;
  createdAt: Date;
  mood: MoodEnum;
  mode: BlogPostModeEnum;
  likes: number;

  constructor(post: BlogPostEntity) {
    this.id = post.id;
    this.title = post.title;
    this.createdAt = post.created_at;
    this.mood = post.mood;
    this.mode = post.mode;
    this.likes = post.likes;
  }
}
