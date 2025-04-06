import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  UseFilters,
  Query,
} from "@nestjs/common";
import { CreateCategoryInputDto } from "../dtos/input/create-category.dto";
import { CategoryOutputDto } from "../dtos/output/output-category.dto";
import { HttpExceptionFilter } from "../../core/exception-filter/http.exception-filter";
import { CategoryService } from "../services/category.service";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from "../../core/constants/pagination.constant";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import { CategoriesWithCount } from "../dtos/output/category.return-type";

@UseFilters(HttpExceptionFilter)
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/list")
  async getCategoryList(
    @Query("page") page: number = DEFAULT_PAGE,
    @Query("limit") limit: number = DEFAULT_LIMIT,
  ): Promise<CategoriesWithCount> {
    return await this.categoryService.list(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  async getCategoryById(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<CategoryOutputDto> {
    return await this.categoryService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() body: CreateCategoryInputDto,
  ): Promise<CategoryOutputDto> {
    return await this.categoryService.create(body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param("id", CheckUUIDPipe) id: string): Promise<void> {
    await this.categoryService.delete(id);
  }
}
