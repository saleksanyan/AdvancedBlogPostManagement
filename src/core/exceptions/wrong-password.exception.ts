import { HttpException, HttpStatus } from "@nestjs/common";

export class WrongPasswordOrUsernameException extends HttpException {
  constructor(message: string = "Wrong password or username") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "WrongPasswordOrUsernameException";
  }
}
