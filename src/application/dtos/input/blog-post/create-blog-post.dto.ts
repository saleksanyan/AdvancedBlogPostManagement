import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBlogPostInputDto {
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
  @IsUUID('all', { each: true })
  categories: string[];

  constructor(title: string, content: string, authorId: string) {
    this.title = title;
    this.content = content;
    this.authorId = authorId;
  }
}
