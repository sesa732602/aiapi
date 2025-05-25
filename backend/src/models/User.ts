/**
 * 用户模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { TeamMember } from './TeamMember';
import { ApiPermission } from './ApiPermission';
import { Order } from './Order';
import { UserQuota } from './UserQuota';
import { ApiCall } from './ApiCall';

// 用户角色枚举
/* eslint-disable no-unused-vars */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user'
}
/* eslint-enable no-unused-vars */

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
    role!: string;

  @Column({ nullable: true })
    avatar!: string;

  @Column({ nullable: true })
    googleId!: string;

  @Column({ nullable: true })
    wechatId!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  // 关系字段
  @OneToMany(() => TeamMember, teamMember => teamMember.user)
    teamMemberships!: TeamMember[];

  @OneToMany(() => ApiPermission, permission => permission.user)
    apiPermissions!: ApiPermission[];

  @OneToMany(() => Order, order => order.user)
    orders!: Order[];

  @OneToMany(() => UserQuota, quota => quota.user)
    quotas!: UserQuota[];

  @OneToMany(() => ApiCall, call => call.user)
    apiCalls!: ApiCall[];
}
