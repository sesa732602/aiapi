/**
 * API权限模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Api } from './Api';
import { Team } from './Team';
import { User } from './User';

// 权限类型枚举
/* eslint-disable no-unused-vars */
export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}
/* eslint-enable no-unused-vars */

@Entity()
export class ApiPermission extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    apiId!: number;

  @Column({ nullable: true })
    userId!: number | null;

  @Column({ nullable: true })
    teamId!: number | null;

  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.READ
  })
    permissionType!: PermissionType;

  @Column({
    type: 'varchar',
    length: 50
  })
    type!: string;

  @Column()
    targetId!: number;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  // 关系字段
  @ManyToOne(() => Api, api => api.permissions)
    api!: Api;

  @ManyToOne(() => User, user => user.apiPermissions)
    user!: User;

  @ManyToOne(() => Team, team => team.apiPermissions)
    team!: Team;
}
