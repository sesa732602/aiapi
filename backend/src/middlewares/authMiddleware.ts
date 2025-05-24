/**
 * 认证中间件
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../models/User';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 验证JWT令牌
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '令牌无效或已过期' });
      }

      req.user = user as Record<string, unknown>;
      next();
    });
  } else {
    res.status(401).json({ message: '未提供认证令牌' });
  }
};

/**
 * 验证用户是否为管理员
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '需要管理员权限' });
  }
};

/**
 * 验证用户是否为API所有者
 */
export const isApiOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ message: '未授权' });
    }

    const apiRepository = getRepository('Api');
    const api = await apiRepository.findOne({ where: { id: apiId } });

    if (!api) {
      return res.status(404).json({ message: 'API不存在' });
    }

    if (api.ownerId === userId || req.user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: '您不是此API的所有者' });
    }
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户请求类型扩展
export interface AuthenticatedRequest extends Request {
  user?: Record<string, unknown>;
}
