/**
 * API版本模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Api } from './Api';

@Entity()
export class ApiVersion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  apiId!: number;

  @Column()
  version!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: false })
  isCurrent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @ManyToOne(() => Api, api => api.versions)
  api!: Api;
}
