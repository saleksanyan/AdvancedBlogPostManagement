import { UpdateUserInputDto } from "src/application/dtos/input/user/update-user.dto";

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly updateUserInputDto: UpdateUserInputDto,
  ) {}
}
