/**
 * API模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { ApiVersion } from './ApiVersion';
import { ApiPermission } from './ApiPermission';
import { ApiPlan } from './ApiPlan';
import { ApiCall } from './ApiCall';

export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

@Entity()
export class Api extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  path!: string;

  @Column({
    type: 'enum',
    enum: ApiMethod,
    default: ApiMethod.GET
  })
  method!: ApiMethod;

  @Column({ nullable: true })
  teamId!: number | null;

  @Column()
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @OneToMany(() => ApiVersion, version => version.api)
  versions!: ApiVersion[];

  @OneToMany(() => ApiPermission, permission => permission.api)
  permissions!: ApiPermission[];

  @OneToMany(() => ApiPlan, plan => plan.api)
  plans!: ApiPlan[];

  @OneToMany(() => ApiCall, call => call.api)
  calls!: ApiCall[];
}
