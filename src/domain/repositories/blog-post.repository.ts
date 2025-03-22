import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { BlogPostModel } from '../models/blog-post.model';
import { BlogPostStatusEnum } from '../enums/blog-post.enum';
import { UpdateStatusInputDto } from 'src/application/dtos/input/blog-post/update-status.dto';

export interface IBlogPostRepository {
  create(post: BlogPostModel): Promise<BlogPostModel>;
  update(post: BlogPostModel): Promise<BlogPostModel>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<BlogPostModel>;
  getList(options: IPaginationOptions): Promise<Pagination<BlogPostModel>>;
  getByCategory(
    categoryId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<BlogPostModel>>;
  getByStatus(
    status: BlogPostStatusEnum,
    options: IPaginationOptions,
  ): Promise<Pagination<BlogPostModel>>;
  updateStatus(
    id: string,
    updateStatusInputDto: UpdateStatusInputDto,
  ): Promise<BlogPostModel>;
}
