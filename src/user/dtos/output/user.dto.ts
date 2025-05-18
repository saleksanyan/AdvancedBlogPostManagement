import { UserEntity } from "../../../user/entities/user.entity";

export class UserOutputDto {
  id: string;
  username: string;
  email: string;
  status: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.status = user.status;
  }
}
