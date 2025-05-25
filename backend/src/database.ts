/**
 * 数据库连接配置
 */
/* eslint-env node */
import { DataSource, DataSourceOptions } from 'typeorm';
import { dbConfig } from './config/database';
import { User } from './models/User';
import { Team } from './models/Team';
import { TeamMember } from './models/TeamMember';
import { Api } from './models/Api';
import { ApiVersion } from './models/ApiVersion';
import { ApiPermission } from './models/ApiPermission';
import { ApiPlan } from './models/ApiPlan';
import { Order } from './models/Order';
import { ApiCall } from './models/ApiCall';
import { UserQuota } from './models/UserQuota';

// 创建数据库连接
export const AppDataSource = new DataSource({
  type: 'mysql', // 明确指定类型为mysql而非aurora-mysql
  ...dbConfig,
  entities: [
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
  ],
  migrations: [],
  subscribers: []
} as DataSourceOptions);

// 初始化数据库连接
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    await AppDataSource.initialize();
    // eslint-disable-next-line no-undef
    console.log('数据库连接已初始化');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('数据库连接失败:', error);
    throw error;
  }
};
