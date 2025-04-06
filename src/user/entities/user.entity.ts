import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { CommentEntity } from "../../comment/entities/comment.entity";
import { VerificationCodeEntity } from "./verification-code.entity";
import { AccessTokenEntity } from "./access-token.entity";
import { UserStatusEnum } from "../../core/enums/user.enum";

@Entity("user")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
    nullable: false,
    type: "varchar",
  })
  username: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  password: string;

  @Column({
    nullable: false,
    type: "varchar",
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: UserStatusEnum,
  })
  status: UserStatusEnum;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToMany(() => BlogPostEntity, (blogPost) => blogPost.author)
  blogPosts: BlogPostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(
    () => VerificationCodeEntity,
    (verificationCode) => verificationCode.user,
  )
  verificationCodes: VerificationCodeEntity[];

  @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user)
  accessTokens: AccessTokenEntity[];
}
