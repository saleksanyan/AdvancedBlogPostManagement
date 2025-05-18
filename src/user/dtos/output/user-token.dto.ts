import { UserEntity } from "../../../user/entities/user.entity";
import { UserOutputDto } from "./user.dto";

export class UserTokenOutputDto {
  user: UserOutputDto;
  token: string;

  constructor(user: UserEntity, token: string) {
    this.user = new UserOutputDto(user);
    this.token = token;
  }
}
