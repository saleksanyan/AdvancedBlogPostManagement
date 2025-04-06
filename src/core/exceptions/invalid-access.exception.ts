import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidAccessException extends HttpException {
  constructor(message: string = "Invalid access!") {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = "InvalidAccessException";
  }
}
