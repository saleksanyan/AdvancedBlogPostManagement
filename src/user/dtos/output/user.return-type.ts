import { UserOutputDto } from "./user.dto";

export class UsersWithCount {
  users: UserOutputDto[];
  total: number;

  constructor(posts: UserOutputDto[], total: number) {
    this.users = posts;
    this.total = total;
  }
}
