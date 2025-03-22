import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryInputDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
