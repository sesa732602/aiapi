/**
 * 用户模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { TeamMember } from './TeamMember';
import { ApiPermission } from './ApiPermission';
import { ApiCall } from './ApiCall';
import { Order } from './Order';
import { UserQuota } from './UserQuota';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user'
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({ nullable: true })
  googleId!: string | null;

  @Column({ nullable: true })
  wechatId!: string | null;

  @Column({ nullable: true })
  avatar!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMemberships!: TeamMember[];

  @OneToMany(() => ApiPermission, permission => permission.user)
  apiPermissions!: ApiPermission[];

  @OneToMany(() => ApiCall, apiCall => apiCall.user)
  apiCalls!: ApiCall[];

  @OneToMany(() => Order, order => order.user)
  orders!: Order[];

  @OneToMany(() => UserQuota, quota => quota.user)
  quotas!: UserQuota[];
}
