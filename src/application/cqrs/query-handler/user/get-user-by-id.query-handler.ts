import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { GetUserByIdQuery } from '../../query/user/get-user-by-id.query';
import { Inject } from '@nestjs/common';
import { UserOutputDTO } from 'src/application/dtos/output/user/output-user.dto';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserOutputDTO> {
    const user = await this.userRepository.getById(query.id);
    return new UserOutputDTO(
      user.id.getValue(),
      user.username.getValue(),
      user.mail.getValue(),
    );
  }
}
