import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { MoodEnum } from "src/core/enums/mood.enum";

export class CreateBlogPostInputDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsArray()
  categories: string[];

  @IsNotEmpty()
  @IsString()
  mood: MoodEnum;
}
