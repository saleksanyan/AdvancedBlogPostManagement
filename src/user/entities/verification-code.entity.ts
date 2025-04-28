import { VerificationCodeStatusEnum } from "../../core/enums/verification-code-status.enum";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("verification_code")
export class VerificationCodeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.verificationCodes)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ type: "varchar", length: 10 })
  code: string;

  @Column({ type: "enum", enum: VerificationCodeStatusEnum })
  status: VerificationCodeStatusEnum;

  @Column({ type: "int", default: 0})
  attemp_count: number;

  @Column({ type: "timestamp", nullable: true })
  expires_at: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
