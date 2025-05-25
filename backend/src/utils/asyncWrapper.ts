/**
 * 异步包装器工具函数
 */
/* eslint-env node */
/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * 包装异步控制器方法，统一处理错误
 * @param fn 异步控制器函数
 */
export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // eslint-disable-next-line no-undef
      console.error('异步操作错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        // eslint-disable-next-line no-undef
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
};
