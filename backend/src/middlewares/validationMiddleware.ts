/**
 * 输入验证中间件
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';

/**
 * 验证请求参数
 * @param validations 验证规则链
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 执行所有验证规则
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);
    
    // 如果有错误，返回400状态码和错误信息
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array().map((err: ValidationError) => {
          // 安全地获取字段名，兼容不同版本的express-validator
          let fieldName = '未知字段';
          
          if ('param' in err) {
            fieldName = err.param as string;
          } else if ('path' in err) {
            fieldName = (err as any).path;
          } else if ('location' in err && 'path' in err) {
            fieldName = `${(err as any).location}.${(err as any).path}`;
          }
          
          return {
            field: fieldName,
            message: err.msg
          };
        })
      });
    }

    // 验证通过，继续下一步
    next();
  };
};
