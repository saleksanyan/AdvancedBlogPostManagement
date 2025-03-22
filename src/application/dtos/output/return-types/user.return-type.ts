import { UserOutputDTO } from '../user/output-user.dto';

export class UsersWithCount {
  users: UserOutputDTO[];
  total: number;

  constructor(posts: UserOutputDTO[], total: number) {
    this.users = posts;
    this.total = total;
  }
}
