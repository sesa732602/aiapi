/**
 * 实体模型注册模块
 */
import { User } from './User';
import { Team } from './Team';
import { TeamMember } from './TeamMember';
import { Api } from './Api';
import { ApiVersion } from './ApiVersion';
import { ApiPermission } from './ApiPermission';
import { ApiPlan } from './ApiPlan';
import { Order } from './Order';
import { ApiCall } from './ApiCall';
import { UserQuota } from './UserQuota';

/**
 * 注册所有实体模型
 * @returns 实体模型数组
 */
export const registerEntities = () => [
  User,
  Team,
  TeamMember,
  Api,
  ApiVersion,
  ApiPermission,
  ApiPlan,
  Order,
  ApiCall,
  UserQuota
];
