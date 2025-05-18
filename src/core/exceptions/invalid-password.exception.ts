import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidPasswordException extends HttpException {
  constructor(message: string = "Passwords do not match!") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "InvalidPasswordFoundException";
  }
}
