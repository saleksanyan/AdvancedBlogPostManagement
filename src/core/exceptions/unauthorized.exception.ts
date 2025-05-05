import { HttpException, HttpStatus } from "@nestjs/common";

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Invalid access!") {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = "UnauthorizedException";
  }
}
