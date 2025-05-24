/**
 * API权限模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Api } from './Api';
import { User } from './User';
import { Team } from './Team';

export enum ApiPermissionType {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

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
    enum: ApiPermissionType,
    default: ApiPermissionType.READ
  })
  permissionType!: ApiPermissionType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @ManyToOne(() => Api, api => api.permissions)
  api!: Api;

  @ManyToOne(() => User, user => user.apiPermissions, { nullable: true })
  user!: User | null;

  @ManyToOne(() => Team, team => team.apiPermissions, { nullable: true })
  team!: Team | null;
}
