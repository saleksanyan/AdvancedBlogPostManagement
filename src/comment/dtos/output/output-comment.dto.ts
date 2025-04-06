import { CommentEntity } from "src/comment/entities/comment.entity";

export class CommentOutputDto {
  id: string;
  comment: string;
  authorId: string;
  postId: string;

  constructor(comment: CommentEntity) {
    this.id = comment.id;
    this.authorId = comment.author.id;
    this.postId = comment.post.id;
    this.comment = comment.content;
  }
}
