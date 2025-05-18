import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "src/user/controllers/user.controller";
import { AuthMiddleware } from "src/core/middlewares/auth.middleware";
import { UserService } from "src/user/services/user.service";
import { SendGridEmailProvider } from "src/core/email/interfaces/sendgrid-email-provider";
import { AccessTokenEntity } from "../entities/access-token.entity";
import { UserEntity } from "../entities/user.entity";
import { VerificationCodeEntity } from "../entities/verification-code.entity";
import { NotificationEntity } from "src/notification/entities/notification.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AccessTokenEntity,
      VerificationCodeEntity,
      NotificationEntity,
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
        { path: "post/:id", method: RequestMethod.GET },
        { path: "category/list", method: RequestMethod.GET },
        {
          path: "post/category/:categoryName/with-pages",
          method: RequestMethod.GET,
        },
        {
          path: "post/edit-text",
          method: RequestMethod.POST,
        },
        { path: "search", method: RequestMethod.GET },
        { path: "comment/list/:postId", method: RequestMethod.GET },
        { path: "post/category/:categoryName", method: RequestMethod.GET },
        { path: "notifications", method: RequestMethod.POST },
      )
      .forRoutes("*");
  }
}
