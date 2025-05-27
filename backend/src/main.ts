/// <reference path="./types/index.d.ts" />
//
/**
 * 应用入口文件
 */
/* eslint-env node */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 加载环境变量
dotenv.config();

import { initializeDatabase } from './database';

// 创建Express应用
const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      // eslint-disable-next-line no-undef
      console.error('数据库初始化失败，服务器无法启动');
      // eslint-disable-next-line no-undef
      process.exit(1);
    }
    
    // 动态导入路由，避免循环依赖
    const { default: routes } = await import('./routes');
    
    // API路由
    app.use('/api', routes);
    
    // 启动服务器
    app.listen(port, () => {
      // eslint-disable-next-line no-undef
      console.log(`服务器运行在 http://localhost:${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('服务器启动失败:', error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
};

startServer();
