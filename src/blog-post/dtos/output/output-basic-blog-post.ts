import { MoodEnum } from "src/core/enums/mood.enum";
import { BlogPostEntity } from "../../../blog-post/entities/blog-post.entity";

export class BasicBlogPostOutputDto {
  id: string;
  title: string;
  createdAt: Date;
  mood: MoodEnum;

  constructor(post: BlogPostEntity) {
    this.id = post.id;
    this.title = post.title;
    this.createdAt = post.created_at;
    this.mood = post.mood;
  }
}