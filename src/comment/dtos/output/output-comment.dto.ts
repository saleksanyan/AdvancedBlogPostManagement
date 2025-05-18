import { CommentEntity } from "src/comment/entities/comment.entity";

export class CommentOutputDto {
  id: string;
  comment: string;
  authorName: string;
  postId: string;
  createdAt: Date;

  constructor(comment: CommentEntity) {
    this.id = comment.id;
    this.authorName = comment.author.username;
    this.postId = comment.post.id;
    this.comment = comment.content;
    this.createdAt = comment.created_at;
  }
}
