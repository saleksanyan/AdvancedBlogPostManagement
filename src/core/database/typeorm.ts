import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { join } from "path";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { CommentEntity } from "../../comment/entities/comment.entity";
import { AccessTokenEntity } from "../../user/entities/access-token.entity";
import { UserEntity } from "../../user/entities/user.entity";
import { VerificationCodeEntity } from "../../user/entities/verification-code.entity";

config({ path: `.env` });

export const createDataSourceOptions = (
  configService: ConfigService,
): DataSourceOptions => {
  return {
    type: "postgres",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    username: configService.get<string>("POSTGRES_USER"),
    password: configService.get<string>("POSTGRES_PASSWORD"),
    database: configService.get<string>("POSTGRES_DB"),
    synchronize: false,
    logging: true,
    entities: [
      UserEntity,
      BlogPostEntity,
      CategoryEntity,
      CommentEntity,
      AccessTokenEntity,
      VerificationCodeEntity,
    ],
    migrations: [join(__dirname, "migrations/*{.ts,.js}")],
    migrationsTableName: "migrations",
    migrationsRun: false,
  };
};

const configService = new ConfigService();
export const AppDataSource = new DataSource(
  createDataSourceOptions(configService),
);
