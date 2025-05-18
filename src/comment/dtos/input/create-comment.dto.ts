import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCommentInputDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  postId: string;
}
