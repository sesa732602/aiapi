/**
 * 团队邀请模型
 * 记录团队邀请状态和相关信息
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './Team';
import { User } from './User';

// 邀请状态枚举
export enum InvitationStatus {
  PENDING = 'pending',    // 待处理
  ACCEPTED = 'accepted',  // 已接受
  REJECTED = 'rejected',  // 已拒绝
  EXPIRED = 'expired'     // 已过期
}

// 团队成员角色枚举
export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

@Entity('team_invitations')
export class TeamInvitation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  teamId!: number;

  @Column()
  inviterId!: number;  // 邀请人ID

  @Column()
  inviteeId!: number;  // 被邀请人ID

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })
  status!: InvitationStatus;

  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
    default: 'member'
  })
  role!: string;

  @Column({ nullable: true })
  message!: string;  // 邀请消息

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;  // 过期时间

  @Column({ type: 'timestamp', nullable: true })
  respondedAt!: Date | null;  // 响应时间

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关联团队
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team!: Team;

  // 关联邀请人
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviterId' })
  inviter!: User;

  // 关联被邀请人
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviteeId' })
  invitee!: User;
}
