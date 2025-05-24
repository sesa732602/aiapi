/**
 * 异步控制器包装函数
 * 用于处理Express路由处理器中的Promise返回值问题
 * 将Promise<Response>转换为void类型，符合Express类型定义
 */
import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any>;

/**
 * 包装异步控制器方法，统一处理错误
 * @param fn 异步控制器方法
 * @returns Express兼容的路由处理器
 */
export const asyncWrapper = (fn: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
