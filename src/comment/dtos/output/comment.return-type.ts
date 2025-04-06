import { CommentOutputDto } from "./output-comment.dto";

export class CommentWithCount {
  comments: CommentOutputDto[];
  total: number;

  constructor(comments: CommentOutputDto[], total: number) {
    this.comments = comments;
    this.total = total;
  }
}
