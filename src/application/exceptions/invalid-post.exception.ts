import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidPostException extends HttpException {
  constructor(message: string = 'Invalid post') {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'InvalidPostException';
  }
}
