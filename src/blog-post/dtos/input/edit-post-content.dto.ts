import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EditPostContentInputDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  makeFancy: boolean;
}
