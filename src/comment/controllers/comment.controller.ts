import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  UseFilters,
  Req,
  Delete,
} from "@nestjs/common";
import { HttpExceptionFilter } from "src/core/exception-filter/http.exception-filter";
import { CommentService } from "../services/comment.service";
import { CreateCommentInputDto } from "../dtos/input/create-comment.dto";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Comments")
@UseFilters(HttpExceptionFilter)
@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(200)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Add a comment",
    description: "Allows an authenticated user to add a comment to a post.",
  })
  @ApiResponse({ status: 200, description: "Comment added successfully." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  async addComment(
    @Body() commentDto: CreateCommentInputDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user;
    return await this.commentService.addComment(userId, commentDto);
  }

  @HttpCode(204)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete a comment",
    description:
      "Deletes a comment by ID. Only the comment's author can delete it.",
  })
  @ApiResponse({ status: 204, description: "Comment deleted successfully." })
  @ApiResponse({ status: 404, description: "Comment not found." })
  async delete(@Param("id", CheckUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req as any).user;
    return await this.commentService.delete(id, userId);
  }

  @HttpCode(200)
  @Get(":id")
  @ApiOperation({
    summary: "Get a comment by ID",
    description: "Retrieves a single comment by its UUID.",
  })
  @ApiResponse({ status: 200, description: "Comment retrieved successfully." })
  @ApiResponse({ status: 404, description: "Comment not found." })
  async getById(@Param("id", CheckUUIDPipe) id: string) {
    return await this.commentService.getById(id);
  }

  @HttpCode(200)
  @Get("list/:postId")
  @ApiOperation({
    summary: "List comments for a post",
    description: "Fetches all comments associated with a given post ID.",
  })
  @ApiResponse({ status: 200, description: "Comments listed successfully." })
  @ApiResponse({ status: 404, description: "Post not found or no comments." })
  async list(@Param("postId", CheckUUIDPipe) postId: string) {
    return await this.commentService.list(postId);
  }
}
