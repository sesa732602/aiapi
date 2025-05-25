import { Express } from 'express';

/**
 * 扩展Express命名空间中的User接口
 * 确保req.user对象包含所需的属性
 */
declare global {
  namespace Express {
    interface User {
      id: number;      // 用户ID
      username: string; // 用户名
      email: string;   // 电子邮箱
      role: string;    // 用户角色
    }
  }
}
