import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
