import { BasicBlogPostOutputDto } from "src/blog-post/dtos/output/output-basic-blog-post";
import { UserEntity } from "src/user/entities/user.entity";

export class UserPostOutputDto {
  id: string;
  username: string;
  email: string;
  status: string;
  posts: BasicBlogPostOutputDto[];

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.status = user.status;
    this.posts = user.blogPosts?.map(post => new BasicBlogPostOutputDto(post));
  }
}