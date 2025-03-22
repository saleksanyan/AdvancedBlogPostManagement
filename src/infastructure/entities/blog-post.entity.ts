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
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import { BlogPostStatusEnum } from '../../domain/enums/blog-post.enum';
import { CommentEntity } from './comment.entity';

@Entity('blog_post')
export class BlogPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: BlogPostStatusEnum,
    default: BlogPostStatusEnum.ACTIVE,
  })
  status: BlogPostStatusEnum;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.blogPosts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  author: UserEntity;

  @ManyToMany(() => CategoryEntity, (category) => category.posts, {
    onDelete: 'CASCADE',
  })
  categories: CategoryEntity[];

  @Column({
    type: 'int',
    nullable: false,
    default: 0
  })
  likes: number;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
