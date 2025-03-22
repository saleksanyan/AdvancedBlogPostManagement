import { Module } from '@nestjs/common';
import { UserModule } from './infastructure/modules/user.module';
import { BlogPostModule } from './infastructure/modules/blog-post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './infastructure/database/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './infastructure/modules/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    BlogPostModule,
    CategoryModule,
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
