import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { BlogPostStatusEnum } from "src/core/enums/blog-post.enum";

export class UpdateStatusInputDto {
  @IsNotEmpty()
  @IsString()
  status: BlogPostStatusEnum;
}
