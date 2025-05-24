/**
 * 团队模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import { TeamMember } from './TeamMember';
import { ApiPermission } from './ApiPermission';
import { Api } from './Api';

@Entity()
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @OneToMany(() => TeamMember, member => member.team)
  members!: TeamMember[];

  @OneToMany(() => ApiPermission, permission => permission.team)
  apiPermissions!: ApiPermission[];

  @OneToMany(() => Api, api => api.teamId)
  apis!: Api[];
}
