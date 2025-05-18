import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class NotificationInputDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  link?: string;
}
