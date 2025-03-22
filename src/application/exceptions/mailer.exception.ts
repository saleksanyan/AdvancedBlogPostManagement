import { HttpException, HttpStatus } from '@nestjs/common';

export class MailerException extends HttpException {
  constructor(message: string = 'Failed to send email') {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'MailerException';
  }
}