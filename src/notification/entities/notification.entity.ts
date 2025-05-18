import { UserEntity } from "../../user/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";

@Entity()
export class NotificationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column()
  type: string;

  @Column({ nullable: true })
  link: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
