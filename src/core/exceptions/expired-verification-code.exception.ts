import { HttpException, HttpStatus } from "@nestjs/common";

export class ExpiredVerificationCodeException extends HttpException {
  constructor(message: string = "Expired Verification Code!") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "ExpiredVerificationCodeException";
  }
}
