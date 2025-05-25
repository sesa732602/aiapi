/**
 * API调用记录模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Api } from './Api';
import { User } from './User';

@Entity()
export class ApiCall extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column({ nullable: true })
    userId!: number | null;

  @Column()
    apiId!: number;

  @Column()
    startTime!: Date;

  @Column()
    responseTime!: number;

  @Column({ name: 'statusCode' })
    status!: number;

  @Column({ nullable: true })
    requestSize!: number;

  @Column({ nullable: true })
    responseSize!: number;

  @Column({ type: 'text', nullable: true })
    requestData!: string | null;

  @Column({ type: 'text', nullable: true })
    responseData!: string | null;

  @CreateDateColumn()
    createdAt!: Date;

  // 关系字段
  @ManyToOne(() => Api, api => api.calls)
    api!: Api;

  @ManyToOne(() => User, user => user.apiCalls)
    user!: User;
}
