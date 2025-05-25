/**
 * 数据库配置
 */
import { DataSourceOptions } from 'typeorm';

// 本地开发环境数据库配置
export const localDbConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'api_management',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true'
};

// Aurora MySQL 数据库配置
export const auroraDbConfig: DataSourceOptions = {
  type: 'aurora-mysql' as const,
  region: process.env.AWS_REGION || 'us-east-1',
  secretArn: process.env.DB_SECRET_ARN || '',
  resourceArn: process.env.DB_RESOURCE_ARN || '',
  database: process.env.DB_NAME || 'api_management',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true'
};

// 根据环境选择数据库配置
export const getDbConfig = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && process.env.DB_SECRET_ARN && process.env.DB_RESOURCE_ARN) {
    return auroraDbConfig;
  }
  
  return localDbConfig;
};
