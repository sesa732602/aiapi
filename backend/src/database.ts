/**
 * 数据库连接模块
 */
/* eslint-env node */
import { DataSource } from 'typeorm';
import { getDbConfig } from './config/database';
import { registerEntities } from './models';

// 创建数据库连接
export const AppDataSource = new DataSource({
  ...getDbConfig(),
  entities: registerEntities(),
  migrations: [],
  subscribers: []
});

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
