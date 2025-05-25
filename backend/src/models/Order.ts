/**
 * 订单模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { User } from './User';
import { Api } from './Api';
import { ApiPlan } from './ApiPlan';

/**
 * 订单状态枚举
 */
/* eslint-disable no-unused-vars */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}
/* eslint-enable no-unused-vars */

/**
 * 订单实体
 */
@Entity('orders')
export class Order extends BaseEntity {
  /**
   * 订单ID
   */
  @PrimaryGeneratedColumn()
    id!: number;

  /**
   * 用户ID
   */
  @Column()
    userId!: number;

  /**
   * API ID
   */
  @Column()
    apiId!: number;

  /**
   * 套餐ID
   */
  @Column()
    planId!: number;

  /**
   * 订单金额
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

  /**
   * 订单状态
   */
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status!: string;

  /**
   * 调用次数限制
   */
  @Column()
    callLimit!: number;

  /**
   * 并发限制
   */
  @Column()
    concurrencyLimit!: number;

  /**
   * 有效期（天）
   */
  @Column()
    validityDays!: number;

  /**
   * 支付时间
   */
  @Column({ nullable: true })
    paidAt!: Date;

  /**
   * 取消时间
   */
  @Column({ nullable: true })
    cancelledAt!: Date;

  /**
   * 创建时间
   */
  @CreateDateColumn()
    createdAt!: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn()
    updatedAt!: Date;

  /**
   * 关联用户
   */
  @ManyToOne(() => User, user => user.orders)
    user!: User;

  /**
   * 关联API
   */
  @ManyToOne(() => Api)
    api!: Api;

  /**
   * 关联套餐
   */
  @ManyToOne(() => ApiPlan)
    plan!: ApiPlan;
}
