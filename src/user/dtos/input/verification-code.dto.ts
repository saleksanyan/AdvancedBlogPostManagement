import { IsNotEmpty, IsString } from "class-validator";

export class VerificationCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
