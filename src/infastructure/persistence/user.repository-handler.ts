import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers/user/user.mapper';
import { DuplicateValueException } from 'src/application/exceptions/duplicate-value.exception';
import { UserNotFoundException } from 'src/application/exceptions/user-not-found.exception';
import { UserModel } from 'src/domain/models/user.model';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepositoryHandler implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(user: UserModel): Promise<UserModel> {
    const userWithDublicateUsername = await this.repository.findOne({
      where: { username: user.username.getValue() },
    });

    if (userWithDublicateUsername) {
      throw new DuplicateValueException(
        `User with username '${user.username.getValue()}' already exists`,
      );
    }

    const userEntity = this.repository.create({
      username: user.username.getValue(),
      password: user.password.getValue(),
      mail: user.mail.getValue(),
    });

    const savedEntity = await this.repository.save(userEntity);

    return UserMapper.toModel(savedEntity);
  }

  async update(user: UserModel): Promise<UserModel> {
    const userWithDublicateUsername = await this.repository.findOne({
      where: { username: user.username.getValue() },
    });

    if (userWithDublicateUsername) {
      throw new DuplicateValueException(
        `User with username '${user.username.getValue()}' already exists`,
      );
    }

    const userEntity = await this.repository.findOne({
      where: { id: user.id.getValue() },
    });

    if (!userEntity) {
      throw new UserNotFoundException(`User with ID ${user.id} not found`);
    }

    const updatedEntity = await this.repository.save(UserMapper.toEntity(user));

    return UserMapper.toModel(updatedEntity);
  }

  async getById(id: string): Promise<UserModel> {
    const userEntity = await this.repository.findOne({ where: { id: id } });

    if (!userEntity) {
      throw new UserNotFoundException(`User with ID ${id} not found`);
    }

    return UserMapper.toModel(userEntity);
  }

  async getList(options: IPaginationOptions): Promise<Pagination<UserModel>> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    const paginatedResult = await paginate<UserEntity>(queryBuilder, options);

    return {
      ...paginatedResult,
      items: paginatedResult.items.map(UserMapper.toModel),
    };
  }
}
