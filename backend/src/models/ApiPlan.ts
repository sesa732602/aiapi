/**
 * API套餐模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Api } from './Api';

@Entity()
export class ApiPlan extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    apiId!: number;

  @Column()
    name!: string;

  @Column({ nullable: true })
    description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

  @Column()
    callLimit!: number;

  @Column()
    concurrencyLimit!: number;

  @Column()
    validityDays!: number;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  // 关系字段
  @ManyToOne(() => Api, api => api.plans)
    api!: Api;
}
