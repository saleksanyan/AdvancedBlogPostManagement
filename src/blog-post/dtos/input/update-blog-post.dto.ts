import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { BlogPostModeEnum } from "src/core/enums/blog-post-mode.enum";
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
  mode: BlogPostModeEnum;
}
