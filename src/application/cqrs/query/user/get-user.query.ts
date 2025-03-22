import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export class GetUserListQuery {
  constructor(public readonly options: IPaginationOptions) {}
}
