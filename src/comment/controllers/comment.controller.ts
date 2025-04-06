import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  HttpCode,
  UseFilters,
  Query,
  Req,
  Patch,
  Delete,
} from "@nestjs/common";
import { HttpExceptionFilter } from "src/core/exception-filter/http.exception-filter";
import { CommentService } from "../services/comment.service";
import { CreateCommentInputDto } from "../dtos/input/create-comment.dto";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from "src/core/constants/pagination.constant";

@UseFilters(HttpExceptionFilter)
@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(200)
  @Post()
  async addComment(
    @Body() commentDto: CreateCommentInputDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user;
    return await this.commentService.addComment(userId, commentDto);
  }

  @HttpCode(204)
  @Delete(":id")
  async delete(@Param("id", CheckUUIDPipe) id: string) {
    return await this.commentService.delete(id);
  }

  @HttpCode(200)
  @Get(":id")
  async getById(@Param("id", CheckUUIDPipe) id: string) {
    return await this.commentService.getById(id);
  }

  @HttpCode(200)
  @Get("list/:postId")
  async list(
    @Query("page") page = DEFAULT_PAGE,
    @Query("limit") limit = DEFAULT_LIMIT,
    @Param("postId", CheckUUIDPipe) postId: string,
  ) {
    return await this.commentService.list(page, limit, postId);
  }
}
