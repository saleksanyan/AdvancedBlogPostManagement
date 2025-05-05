import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { MoodEnum } from "src/core/enums/mood.enum";

export class UpdateBlogPostInputDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  authorId: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID("all", { each: true })
  categories: string[];

  @IsNotEmpty()
  @IsString()
  mood: MoodEnum;
}
