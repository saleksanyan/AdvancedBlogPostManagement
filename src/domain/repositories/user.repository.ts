import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UserModel } from '../models/user.model';

export interface IUserRepository {
  create(post: UserModel): Promise<UserModel>;
  update(post: UserModel): Promise<UserModel>;
  getById(id: string): Promise<UserModel>;
  getList(options: IPaginationOptions): Promise<Pagination<UserModel>>;
}
