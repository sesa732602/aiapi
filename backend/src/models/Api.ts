/**
 * API模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { ApiVersion } from './ApiVersion';
import { ApiPermission } from './ApiPermission';
import { ApiCall } from './ApiCall';
import { ApiPlan } from './ApiPlan';

// HTTP方法枚举（用于API定义）
/* eslint-disable no-unused-vars */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}
/* eslint-enable no-unused-vars */

@Entity()
export class Api extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @Column({ nullable: true })
    description!: string;

  @Column()
    baseUrl!: string;

  @Column()
    ownerId!: number;

  @Column({ nullable: true })
    teamId!: number | null;

  @Column({ default: false })
    isPublic!: boolean;

  @Column({ default: true })
    isActive!: boolean;

  @Column({ nullable: true })
    currentVersionId!: number | null;

  @Column({ nullable: true })
    path!: string;

  @Column({ 
    type: 'enum',
    enum: HttpMethod,
    default: HttpMethod.GET
  })
    method!: HttpMethod;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  // 关系字段
  @OneToMany(() => ApiVersion, version => version.api)
    versions!: ApiVersion[];

  @OneToMany(() => ApiPermission, permission => permission.api)
    permissions!: ApiPermission[];

  @OneToMany(() => ApiCall, call => call.api)
    calls!: ApiCall[];

  @OneToMany(() => ApiPlan, plan => plan.api)
    plans!: ApiPlan[];
}
