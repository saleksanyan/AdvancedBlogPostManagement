import { HttpException, HttpStatus } from "@nestjs/common";

export class VerificationCodeRateLimitException extends HttpException {
  constructor(
    message: string = "Wait one minute before resending the verification code!",
  ) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
    this.name = "VerificationCodeRateLimitException";
  }
}
