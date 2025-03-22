import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserModel } from '../../../../domain/models/user.model';
import { CreateUserCommand } from '../../commands/user/create-user.command';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { UserOutputDTO } from 'src/application/dtos/output/user/output-user.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserOutputDTO> {
    const user = new UserModel(
      command.createUserInputDto.username,
      command.createUserInputDto.password,
      command.createUserInputDto.mail,
    );
    const createdUser = await this.userRepository.create(user);

    return new UserOutputDTO(
      createdUser.id.getValue(),
      createdUser.username.getValue(),
      createdUser.mail.getValue(),
    );
  }
}
