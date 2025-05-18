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
} from "@nestjs/common";
import { CreateCategoryInputDto } from "../dtos/input/create-category.dto";
import { CategoryOutputDto } from "../dtos/output/output-category.dto";
import { HttpExceptionFilter } from "../../core/exception-filter/http.exception-filter";
import { CategoryService } from "../services/category.service";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import { CategoriesWithCount } from "../dtos/output/category.return-type";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Categories")
@UseFilters(HttpExceptionFilter)
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/list")
  @ApiOperation({
    summary: "Get all categories",
    description:
      "Returns a list of all blog post categories with their total count.",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved category list.",
    type: CategoriesWithCount,
  })
  async getCategoryList(): Promise<CategoriesWithCount> {
    return await this.categoryService.list();
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id")
  @ApiOperation({
    summary: "Get category by ID",
    description: "Fetches a single category using its UUID.",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved category.",
    type: CategoryOutputDto,
  })
  @ApiResponse({ status: 404, description: "Category not found." })
  async getCategoryById(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<CategoryOutputDto> {
    return await this.categoryService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new category",
    description: "Creates a new blog post category.",
  })
  @ApiResponse({
    status: 201,
    description: "Category successfully created.",
    type: CategoryOutputDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  async createCategory(
    @Body() body: CreateCategoryInputDto,
  ): Promise<CategoryOutputDto> {
    return await this.categoryService.create(body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete category",
    description: "Deletes a category by its UUID.",
  })
  @ApiResponse({ status: 204, description: "Category successfully deleted." })
  @ApiResponse({ status: 404, description: "Category not found." })
  async deleteCategory(@Param("id", CheckUUIDPipe) id: string): Promise<void> {
    await this.categoryService.delete(id);
  }
}
