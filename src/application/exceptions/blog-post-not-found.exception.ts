import { HttpException, HttpStatus } from '@nestjs/common';

export class BlogPostNotFoundException extends HttpException {
  constructor(message: string = 'Blog post not found') {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'BlogPostNotFoundException';
  }
}
