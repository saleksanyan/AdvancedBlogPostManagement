import { HttpException, HttpStatus } from "@nestjs/common";

export class CommentNotFoundException extends HttpException {
  constructor(message: string = "Comment not found") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "CommentNotFoundException";
  }
}
