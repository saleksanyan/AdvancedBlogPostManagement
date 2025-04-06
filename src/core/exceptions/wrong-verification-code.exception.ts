import { HttpException, HttpStatus } from "@nestjs/common";

export class WrongVerificationCodeException extends HttpException {
  constructor(message: string = "Wrong Verification Code") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "WrongVerificationCodeException";
  }
}
