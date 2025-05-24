"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
// src/config/database.ts
/**
 * 数据库配置文件
 */
const dotenv_1 = __importDefault(require("dotenv"));
// 加载环境变量
dotenv_1.default.config();
// 数据库配置
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'api_management',
    synchronize: process.env.NODE_ENV !== 'production', // 非生产环境自动同步数据库结构
    logging: process.env.NODE_ENV !== 'production', // 非生产环境记录SQL日志
};
