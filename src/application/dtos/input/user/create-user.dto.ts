import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserInputDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  mail: string;

  constructor(username: string, password: string, email: string) {
    this.username = username;
    this.password = password;
    this.mail = email;
  }
}
