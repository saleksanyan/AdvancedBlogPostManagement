import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { VerificationCodeStatusEnum } from "src/core/enums/verification-code-status.enum";
import { Repository, QueryRunner, Not } from "typeorm";
import { UserNotFoundException } from "../../core/exceptions/user-not-found.exception";
import { EmailProvider } from "../../core/email/interfaces/email-provider.interface";
import { JwtService } from "@nestjs/jwt";
import { UserOutputDto } from "../dtos/output/user.dto";
import { WrongVerificationCodeException } from "../../core/exceptions/wrong-verification-code.exception";
import { ExpiredVerificationCodeException } from "../../core/exceptions/expired-verification-code.exception";
import { VerificationCodeNotFoundException } from "../../core/exceptions/verification-code-not-found.exception";
import * as bcrypt from "bcryptjs";
import { WrongPasswordOrUsernameException } from "../../core/exceptions/wrong-password.exception";
import { VerificationCodeRateLimitException } from "../../core/exceptions/one-minute-pass.exception";
import { InvalidAccessException } from "../../core/exceptions/invalid-access.exception";
import { InvalidPasswordException } from "../../core/exceptions/invalid-password.exception";

import { CreateUserInputDto } from "../dtos/input/create-user.dto";
import { UpdateUserInputDto } from "../dtos/input/update-user.dto";
import { Paginator } from "../../core/paginator/paginator";
import { DuplicateValueException } from "../../core/exceptions/duplicate-value.exception";
import { CodeTokenOutputDto } from "../dtos/output/code-token.dto";
import { UsersWithCount } from "../dtos/output/user.return-type";
import { AccessTokenEntity } from "../entities/access-token.entity";
import { UserEntity } from "../entities/user.entity";
import { VerificationCodeEntity } from "../entities/verification-code.entity";
import { UserStatusEnum } from "src/core/enums/user.enum";
import { ExceededVerificationCodeAttemptsException } from "src/core/exceptions/exceeded-verification-code-attempts.exception copy";
import { UserPostOutputDto } from "../dtos/output/user-post.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject("EmailProvider")
    private readonly emailProvider: EmailProvider,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithVerficationCode(
    verificationCode: string,
    userId: string,
  ): Promise<UserPostOutputDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { id: userId }, relations: ["blogPosts"] });

      if (!user) {
        throw new UserNotFoundException();
      }

      const storedVerificationCode = await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .findOne({
          where: {
            user: { id: userId },
            status: VerificationCodeStatusEnum.ACTIVE,
          },
        });

      if (!storedVerificationCode) {
        throw new VerificationCodeNotFoundException();
      }

      if (storedVerificationCode.expires_at < new Date()) {
        await queryRunner.manager
          .getRepository(VerificationCodeEntity)
          .update(storedVerificationCode.id, {
            status: VerificationCodeStatusEnum.INACTIVE,
          });

        throw new ExpiredVerificationCodeException();
      }

      if (storedVerificationCode.attemp_count > 3) {
        throw new ExceededVerificationCodeAttemptsException();
      }

      if (verificationCode !== storedVerificationCode.code) {
        await queryRunner.manager
          .getRepository(VerificationCodeEntity)
          .update(storedVerificationCode.id, {
            attemp_count: storedVerificationCode.attemp_count + 1,
          });

        throw new WrongVerificationCodeException();
      }

      await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .update(storedVerificationCode.id, {
          status: VerificationCodeStatusEnum.VERIFIED,
          expires_at: new Date(),
        });

      await queryRunner.commitTransaction();

      return new UserPostOutputDto(user);
    } catch (error) {
      if (error instanceof WrongVerificationCodeException) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerWithVerficationCode(
    verificationCode: string,
    userId: string,
  ): Promise<UserPostOutputDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { id: userId }, relations: ["blogPosts"] });

      if (!user || user.status != UserStatusEnum.UNVERIFIED) {
        throw new UserNotFoundException();
      }

      const storedVerificationCode = await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .findOne({
          where: {
            user: { id: userId },
            status: VerificationCodeStatusEnum.ACTIVE,
          },
        });

      if (!storedVerificationCode) {
        throw new VerificationCodeNotFoundException();
      }

      if (
        storedVerificationCode.expires_at < new Date() ||
        storedVerificationCode.attemp_count > 3
      ) {
        await queryRunner.manager
          .getRepository(VerificationCodeEntity)
          .update(storedVerificationCode.id, {
            status: VerificationCodeStatusEnum.INACTIVE,
          });

        throw new ExpiredVerificationCodeException();
      }

      if (verificationCode !== storedVerificationCode.code) {
        await queryRunner.manager
          .getRepository(VerificationCodeEntity)
          .update(storedVerificationCode.id, {
            attemp_count: storedVerificationCode.attemp_count + 1,
          });

        await queryRunner.commitTransaction();

        throw new WrongVerificationCodeException();
      }

      await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .update(storedVerificationCode.id, {
          status: VerificationCodeStatusEnum.VERIFIED,
          expires_at: new Date(),
        });

      await queryRunner.manager.getRepository(UserEntity).update(user.id, {
        status: UserStatusEnum.ACTIVE,
      });

      const accessToken = await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .findOne({
          where: { user: { id: userId } },
        });

      await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .update(accessToken.id, {
          is_active: false,
        });

      await queryRunner.commitTransaction();

      return new UserPostOutputDto(user);
    } catch (error) {
      if (!(error instanceof WrongVerificationCodeException)) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async resendCode(userId: string): Promise<{ code: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { id: userId } });

      if (!user) {
        throw new UserNotFoundException();
      }

      const storedVerificationCode = await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .findOne({
          where: {
            user: { id: userId },
            status: VerificationCodeStatusEnum.ACTIVE,
          },
        });

      const oneMinute = 60 * 1000;
      if (
        storedVerificationCode &&
        new Date().getTime() - storedVerificationCode.created_at.getTime() <
          oneMinute
      ) {
        throw new VerificationCodeRateLimitException();
      }
      if (storedVerificationCode) {
        await queryRunner.manager
          .getRepository(VerificationCodeEntity)
          .update(storedVerificationCode.id, {
            status: VerificationCodeStatusEnum.INACTIVE,
          });
      }

      const code = await this.createVerificationCode(user, queryRunner);

      await this.emailProvider.sendEmail(
        user.email,
        "Login verification",
        {
          username: user.username,
          digit1: code.charAt(0),
          digit2: code.charAt(1),
          digit3: code.charAt(2),
          digit4: code.charAt(3),
        },
        "registration-confirmation/index",
      );

      await queryRunner.commitTransaction();

      return { code: code };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async loginWithEmailPassword(
    username: string,
    password: string,
  ): Promise<{ token: string; data: any }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { username: username } });

      if (!user || user.status !== UserStatusEnum.ACTIVE) {
        throw new UserNotFoundException();
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new WrongPasswordOrUsernameException();
      }

      const accessToken = await this.createAccessToken(user, queryRunner);

      const code = await this.createVerificationCode(user, queryRunner);

      await this.emailProvider.sendEmail(
        user.email,
        "Login verification",
        {
          username: user.username,
          digit1: code.charAt(0),
          digit2: code.charAt(1),
          digit3: code.charAt(2),
          digit4: code.charAt(3),
        },
        "registration-confirmation/index",
      );

      await queryRunner.commitTransaction();
      return { token: accessToken.token, data: code };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAccessToken(user: UserEntity, queryRunner: QueryRunner) {
    const storedAccessToken = await queryRunner.manager
      .getRepository(AccessTokenEntity)
      .findOne({
        where: { user: { id: user.id }, is_active: true },
      });
    if (storedAccessToken) {
      await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .update(storedAccessToken.id, { is_active: false });
    }

    const payload = {
      sub: user.id,
    };
    const entity = new AccessTokenEntity();
    entity.is_active = true;
    entity.user = user;
    entity.token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return await queryRunner.manager
      .getRepository(AccessTokenEntity)
      .save(entity);
  }

  async createVerificationCode(
    user: UserEntity,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const storedVerificationCode = await queryRunner.manager
      .getRepository(VerificationCodeEntity)
      .findOne({
        where: {
          user: { id: user.id },
          status: VerificationCodeStatusEnum.ACTIVE,
        },
      });
    const oneMinute = 60 * 1000;

    if (
      storedVerificationCode &&
      new Date().getTime() - storedVerificationCode.created_at.getTime() <
        oneMinute
    ) {
      throw new VerificationCodeRateLimitException();
    }

    if (storedVerificationCode) {
      await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .update(storedVerificationCode.id, {
          status: VerificationCodeStatusEnum.INACTIVE,
        });
    }

    const code = randomInt(1000, 9999).toString();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getMinutes() + 15);

    const verificationCode = new VerificationCodeEntity();

    verificationCode.user = user;
    verificationCode.code = code;
    verificationCode.status = VerificationCodeStatusEnum.ACTIVE;
    verificationCode.expires_at = expirationDate;

    await queryRunner.manager
      .getRepository(VerificationCodeEntity)
      .save(verificationCode);

    return code;
  }

  async forgetPassword(
    email: string,
  ): Promise<{ code: string; token: string }> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { email: email } });

      if (!user) {
        throw new UserNotFoundException();
      }

      const code = await this.createVerificationCode(user, queryRunner);
      const token = await this.createAccessToken(user, queryRunner);

      await this.emailProvider.sendEmail(
        email,
        "Password Reset",
        {
          username: user.username,
          digit1: code.charAt(0),
          digit2: code.charAt(1),
          digit3: code.charAt(2),
          digit4: code.charAt(3),
        },
        "password-reset/index",
      );
      await queryRunner.commitTransaction();

      return { code, token: token.token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async resetPassword(
    userId: string,
    password: string,
    confirmPassword: string,
  ) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({ where: { id: userId } });

      if (!user) {
        throw new UserNotFoundException();
      }

      const storedVerificationCode = await queryRunner.manager
        .getRepository(VerificationCodeEntity)
        .findOne({
          where: {
            user: { id: userId },
            status: VerificationCodeStatusEnum.ACTIVE,
          },
        });

      if (storedVerificationCode) {
        throw new InvalidAccessException();
      }
      if (password !== confirmPassword) {
        throw new InvalidPasswordException();
      }

      const existingAccessToken = await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .findOne({
          where: { user: { id: userId }, is_active: true },
        });

      if (!existingAccessToken) {
        throw new InvalidAccessException();
      }

      await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .update(existingAccessToken.id, { is_active: false });

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await queryRunner.manager
        .getRepository(UserEntity)
        .update(userId, { password: hashedPassword });
      await queryRunner.commitTransaction();

      return new UserOutputDto(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async logout(userId: string) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAccessToken = await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .findOne({
          where: { user: { id: userId }, is_active: true },
        });

      if (!existingAccessToken) {
        throw new InvalidAccessException();
      }

      await queryRunner.manager
        .getRepository(AccessTokenEntity)
        .update(existingAccessToken.id, { is_active: false });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async list(page: number, limit: number): Promise<UsersWithCount> {
    const options = { page, limit };

    const queryBuilder = this.userRepository.createQueryBuilder("user");

    const paginatedResult = await Paginator.paginate<UserEntity>(
      queryBuilder,
      options,
    );

    return new UsersWithCount(
      paginatedResult.items.map((item) => new UserOutputDto(item)),
      paginatedResult.meta.totalItems,
    );
  }

  async getById(id: string): Promise<UserPostOutputDto> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ["blogPosts"],
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    return new UserPostOutputDto(user);
  }

  async register(
    createUserInputDto: CreateUserInputDto,
  ): Promise<CodeTokenOutputDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(
        createUserInputDto.password,
        salt,
      );

      const userWithDublicateUsername = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { username: createUserInputDto.username },
        });

      if (userWithDublicateUsername) {
        throw new DuplicateValueException(
          `User with username '${createUserInputDto.username}' already exists`,
        );
      }
      const userWithDublicateEmail = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { email: createUserInputDto.email },
        });

      if (userWithDublicateEmail) {
        throw new DuplicateValueException(
          `User with email '${createUserInputDto.email}' already exists`,
        );
      }

      const userEntity = queryRunner.manager.getRepository(UserEntity).create({
        username: createUserInputDto.username,
        password: hashedPassword,
        email: createUserInputDto.email,
        status: UserStatusEnum.UNVERIFIED,
      });

      const user = await queryRunner.manager
        .getRepository(UserEntity)
        .save(userEntity);

      const code = await this.createVerificationCode(user, queryRunner);
      const token = await this.createAccessToken(user, queryRunner);

      await this.emailProvider.sendEmail(
        user.email,
        "Register verification",
        {
          username: user.username,
          digit1: code.charAt(0),
          digit2: code.charAt(1),
          digit3: code.charAt(2),
          digit4: code.charAt(3),
        },
        "registration-confirmation/index",
      );

      await queryRunner.commitTransaction();

      return new CodeTokenOutputDto(token.token, code);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<UserOutputDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.getRepository(UserEntity).findOne({
        where: { id: id },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      await queryRunner.manager.getRepository(UserEntity).update(id, {
        status: UserStatusEnum.INACTIVE,
      });

      const resultedUser = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { id: id },
        });

      await queryRunner.commitTransaction();

      return new UserOutputDto(resultedUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateUserInputDto: UpdateUserInputDto,
  ): Promise<UserOutputDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userWithDublicateUsername = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { username: updateUserInputDto.username, id: Not(id) },
        });

      if (userWithDublicateUsername) {
        throw new DuplicateValueException(
          `User with username '${updateUserInputDto.username}' already exists`,
        );
      }

      const userWithDublicateEmail = await queryRunner.manager
        .getRepository(UserEntity)
        .findOne({
          where: { username: updateUserInputDto.email, id: Not(id) },
        });

      if (userWithDublicateEmail) {
        throw new DuplicateValueException(
          `User with email '${updateUserInputDto.email}' already exists`,
        );
      }

      const user = await queryRunner.manager.getRepository(UserEntity).findOne({
        where: { id: id },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      const updatedUser = await queryRunner.manager
        .getRepository(UserEntity)
        .save(user);
      await queryRunner.commitTransaction();

      return new UserOutputDto(updatedUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
