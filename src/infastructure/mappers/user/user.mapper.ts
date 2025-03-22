import { UserEntity } from 'src/infastructure/entities/user.entity';
import { UserModel } from '../../../domain/models/user.model';

export class UserMapper {
  static toModel(entity: UserEntity): UserModel {
    return new UserModel(
      entity.username,
      entity.password,
      entity.mail,
      entity.id,
    );
  }

  static toEntity(model: UserModel): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = model.id.getValue();
    userEntity.username = model.username.getValue();
    userEntity.password = model.password.getValue();
    userEntity.mail = model.mail.getValue();

    return userEntity;
  }
}
