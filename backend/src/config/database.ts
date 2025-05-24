// src/config/database.ts
/**
 * 数据库配置文件
 */
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'api_management',
  synchronize: process.env.NODE_ENV !== 'production', // 非生产环境自动同步数据库结构
  logging: process.env.NODE_ENV !== 'production', // 非生产环境记录SQL日志
};
