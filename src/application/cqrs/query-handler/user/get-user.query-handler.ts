import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { GetUserListQuery } from '../../query/user/get-user.query';
import { Inject } from '@nestjs/common';
import { UsersWithCount } from 'src/application/dtos/output/return-types/user.return-type';
import { UserOutputDTO } from 'src/application/dtos/output/user/output-user.dto';

@QueryHandler(GetUserListQuery)
export class GetUserListHandler implements IQueryHandler<GetUserListQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserListQuery): Promise<UsersWithCount> {
    const usersWithPagination = await this.userRepository.getList(
      query.options,
    );
    const users = usersWithPagination.items.map(
      (user) =>
        new UserOutputDTO(
          user.id.getValue(),
          user.username.getValue(),
          user.mail.getValue(),
        ),
    );
    const usersWithCount = new UsersWithCount(
      users,
      usersWithPagination.meta.totalItems,
    );

    return usersWithCount;
  }
}
