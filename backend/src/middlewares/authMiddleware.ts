/**
 * 认证中间件
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

/**
 * JWT认证中间件
 * 验证请求头中的token是否有效
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: '未提供认证令牌' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: '无效的认证令牌' });
  }
};

/**
 * 超级管理员权限中间件
 * 验证用户是否具有超级管理员权限
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: '未认证的用户' });
    return;
  }
  
  if (req.user.role !== 'super_admin') {
    res.status(403).json({ message: '需要超级管理员权限' });
    return;
  }
  
  next();
};

/**
 * 管理员权限中间件
 * 验证用户是否具有管理员或超级管理员权限
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: '未认证的用户' });
    return;
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403).json({ message: '需要管理员权限' });
    return;
  }
  
  next();
};

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
