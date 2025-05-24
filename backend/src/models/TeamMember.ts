/**
 * 团队成员模型定义
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Team } from './Team';
import { User } from './User';

export type TeamMemberRole = 'owner' | 'admin' | 'member';

@Entity()
export class TeamMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  teamId!: number;

  @Column()
  userId!: number;

  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  })
  role!: TeamMemberRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系字段
  @ManyToOne(() => Team, team => team.members)
  team!: Team;

  @ManyToOne(() => User, user => user.teamMemberships)
  user!: User;
}
