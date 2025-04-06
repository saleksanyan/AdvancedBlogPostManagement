import { HttpException, HttpStatus } from "@nestjs/common";

export class VerificationCodeNotFoundException extends HttpException {
  constructor(message: string = "Verification code not found!") {
    super(message, HttpStatus.NOT_FOUND);
    this.name = "VerificationCodeNotFoundException";
  }
}
