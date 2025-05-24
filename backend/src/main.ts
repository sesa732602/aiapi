/**
 * 应用入口文件
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import routes from './routes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', routes);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('数据库初始化失败，服务器无法启动');
      process.exit(1);
    }
    
    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
