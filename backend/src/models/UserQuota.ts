/**
 * 用户额度模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { User } from './User';
import { Api } from './Api';

/**
 * 用户额度实体
 */
@Entity('user_quotas')
export class UserQuota extends BaseEntity {
  /**
   * 额度ID
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
   * 调用次数限制
   */
  @Column()
    callLimit!: number;

  /**
   * 已使用调用次数
   */
  @Column({ default: 0 })
    callsUsed!: number;

  /**
   * 剩余调用次数
   */
  @Column({ default: 0 })
    remainingCalls!: number;

  /**
   * 总调用次数
   */
  @Column({ default: 0 })
    totalCalls!: number;

  /**
   * 并发限制
   */
  @Column()
    concurrencyLimit!: number;

  /**
   * 过期时间
   */
  @Column({ nullable: true, type: 'timestamp' })
    expiresAt!: Date | null;

  /**
   * 关联用户
   */
  @ManyToOne(() => User, user => user.quotas)
    user!: User;

  /**
   * 关联API
   */
  @ManyToOne(() => Api)
    api!: Api;

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
}
