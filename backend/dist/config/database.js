"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbConfig = exports.auroraDbConfig = exports.localDbConfig = void 0;
// 本地开发环境数据库配置
exports.localDbConfig = {
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
exports.auroraDbConfig = {
    type: 'aurora-mysql',
    region: process.env.AWS_REGION || 'us-east-1',
    secretArn: process.env.DB_SECRET_ARN || '',
    resourceArn: process.env.DB_RESOURCE_ARN || '',
    database: process.env.DB_NAME || 'api_management',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true'
};
// 根据环境选择数据库配置
const getDbConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && process.env.DB_SECRET_ARN && process.env.DB_RESOURCE_ARN) {
        return exports.auroraDbConfig;
    }
    return exports.localDbConfig;
};
exports.getDbConfig = getDbConfig;
