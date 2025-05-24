/**
 * 数据库连接配置
 */
import { DataSource } from 'typeorm';
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
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
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
  subscribers: [],
});

// 初始化数据库连接
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('数据库连接已初始化');
    return true;
  } catch (error) {
    console.error('数据库连接初始化失败:', error);
    return false;
  }
};
