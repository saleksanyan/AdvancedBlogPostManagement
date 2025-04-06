import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "src/user/controllers/user.controller";
import { AuthMiddleware } from "src/core/middlewares/auth.middleware";
import { UserService } from "src/user/services/user.service";
import { SendGridEmailProvider } from "src/core/email/interfaces/sendgrid-email-provider";
import { AccessTokenEntity } from "../entities/access-token.entity";
import { UserEntity } from "../entities/user.entity";
import { VerificationCodeEntity } from "../entities/verification-code.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AccessTokenEntity,
      VerificationCodeEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [
    AuthMiddleware,
    UserService,
    {
      provide: "EmailProvider",
      useClass: SendGridEmailProvider,
    },
  ],
  exports: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: "user/login", method: RequestMethod.POST },
        { path: "user/forget-password", method: RequestMethod.POST },
        { path: "user", method: RequestMethod.POST },
      )
      .forRoutes("*");
  }
}
