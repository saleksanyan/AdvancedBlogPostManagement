import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  HttpCode,
  UseFilters,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { CreateCategoryCommand } from '../../application/cqrs/commands/category/create-category.command';
import { DeleteCategoryCommand } from '../../application/cqrs/commands/category/delete-category.command';
import { GetCategoryByIdQuery } from '../../application/cqrs/query/category/get-category-by-id.query';
import { GetCategoryListQuery } from '../../application/cqrs/query/category/get-category.query';
import { CreateCategoryInputDto } from '../../application/dtos/input/category/create-category.dto';
import { CategoryOutputDTO } from '../../application/dtos/output/category/output-category.dto';
import { CategoriesWithCount } from '../../application/dtos/output/return-types/category.return-type';
import { HttpExceptionFilter } from '../../application/exception-filter/http.exception-filter';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../domain/constants/pagination.constant';

@UseFilters(HttpExceptionFilter)
@Controller('category')
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/list')
  async getCategoryList(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_LIMIT,
  ): Promise<CategoriesWithCount> {
    const options: IPaginationOptions = { page, limit };
    const query = new GetCategoryListQuery(options);
    return await this.queryBus.execute(query);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<CategoryOutputDTO> {
    const query = new GetCategoryByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() body: CreateCategoryInputDto,
  ): Promise<CategoryOutputDTO> {
    const command = new CreateCategoryCommand(body);
    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    const command = new DeleteCategoryCommand(id);
    await this.commandBus.execute(command);
  }
}
