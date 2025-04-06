import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BlogPostEntity } from "../../blog-post/entities/blog-post.entity";
import { UserEntity } from "../../user/entities/user.entity";

@Entity("comment")
export class CommentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  content: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  author: UserEntity;

  @ManyToOne(() => BlogPostEntity, (blogPost) => blogPost.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: BlogPostEntity;
}
