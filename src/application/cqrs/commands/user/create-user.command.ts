import { CreateUserInputDto } from "src/application/dtos/input/user/create-user.dto";

export class CreateUserCommand {
  constructor(public readonly createUserInputDto: CreateUserInputDto) {}
}
