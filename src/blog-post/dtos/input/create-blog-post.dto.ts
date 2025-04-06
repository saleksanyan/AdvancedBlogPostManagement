import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateBlogPostInputDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID("all", { each: true })
  categories: string[];
}
