import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { CategoryEntity } from "../../category/entities/category.entity";
import { BlogPostStatusEnum } from "../../core/enums/blog-post.enum";
import { CommentEntity } from "../../comment/entities/comment.entity";
import { UserEntity } from "../../user/entities/user.entity";
import { MoodEnum } from "../../core/enums/mood.enum";

@Entity("blog_post")
export class BlogPostEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  title: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  content: string;

  @Column({
    type: "enum",
    enum: BlogPostStatusEnum,
    default: BlogPostStatusEnum.ACTIVE,
  })
  status: BlogPostStatusEnum;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.blogPosts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  author: UserEntity;

  @ManyToMany(() => CategoryEntity, (category) => category.posts, {
    onDelete: "CASCADE",
  })
  categories: CategoryEntity[];

  @Column({
    type: "int",
    nullable: false,
    default: 0,
  })
  likes: number;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @Column({
    type: "enum",
    enum: MoodEnum,
    nullable: false,
    default: MoodEnum.CALM,
  })
  mood: MoodEnum;
}
