import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "../services/search.service";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: "Search blog posts",
    description:
      "Performs a search across blog posts using the provided query string.",
  })
  @ApiQuery({ name: "q", type: String, description: "Search query string" })
  @ApiResponse({ status: 200, description: "Search completed successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async search(@Query("q") query: string) {
    try {
      const results = await this.searchService.searchPosts(query);
      return {
        success: true,
        data: results,
        message: "Search completed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }
}
