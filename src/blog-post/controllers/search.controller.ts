import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../services/search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    try {
      const results = await this.searchService.searchPosts(query);
      return {
        success: true,
        data: results,
        message: 'Search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
}