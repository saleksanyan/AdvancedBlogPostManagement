import { HttpException, HttpStatus } from "@nestjs/common";

export class ExceededVerificationCodeAttemptsException extends HttpException {
  constructor(message: string = "Exceeded Verification Code Attempts!") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "ExceededVerificationCodeAttemptsException";
  }
}
