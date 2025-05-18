import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserModule } from "./user/modules/user.module";
import { BlogPostModule } from "./blog-post/modules/blog-post.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./core/database/typeorm";
import { ConfigModule } from "@nestjs/config";
import { CategoryModule } from "./category/modules/category.module";
import { JwtModule } from "@nestjs/jwt";
import { CommentModule } from "./comment/modules/comment.module";
import { NotificationsModule } from "./notification/modules/notification.modile";
import { NotificationsGateway } from "./notification/services/notifications.gateway";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommentModule,
    UserModule,
    BlogPostModule,
    CategoryModule,
    NotificationsModule,
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: "5000s" },
    }),
  ],
  controllers: [],
  providers: [NotificationsGateway],
})
export class AppModule {}
