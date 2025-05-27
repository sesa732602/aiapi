/**
 * 用户认证控制器
 */
import { Request, Response, Express } from 'express';
import * as userService from '../services/userService';

/**
 * 标准响应格式
 */
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
}

/**
 * 用户注册
 * @param req 请求对象
 * @param res 响应对象
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.registerUser(username, email, password);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '注册成功',
      data: {
        token: result.token,
        user: result.user
      }
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: error.message || '注册失败',
      errors: [{ type: 'auth', message: error.message || '服务器错误' }]
    };
    
    // 根据错误类型设置状态码
    const statusCode = error.message.includes('已存在') ? 409 : 500;
    res.status(statusCode).json(response);
  }
};

/**
 * 用户登录
 * @param req 请求对象
 * @param res 响应对象
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.loginUser(username, password);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '登录成功',
      data: {
        token: result.token,
        user: result.user
      }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: '登录失败',
      errors: [{ type: 'auth', message: error.message || '用户名或密码错误' }]
    };
    
    res.status(401).json(response);
  }
};

/**
 * Google登录
 * @param req 请求对象
 * @param res 响应对象
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleId, email, name, avatar } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.googleLoginUser(googleId, email, name, avatar);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: 'Google登录成功',
      data: {
        token: result.token,
        user: result.user
      }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: 'Google登录失败',
      errors: [{ type: 'auth', message: error.message || '服务器错误' }]
    };
    
    res.status(500).json(response);
  }
};

/**
 * 微信登录
 * @param req 请求对象
 * @param res 响应对象
 */
export const wechatLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wechatId, nickname, avatar } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.wechatLoginUser(wechatId, nickname, avatar);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '微信登录成功',
      data: {
        token: result.token,
        user: result.user
      }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: '微信登录失败',
      errors: [{ type: 'auth', message: error.message || '服务器错误' }]
    };
    
    res.status(500).json(response);
  }
};

/**
 * 用户登出
 * @param req 请求对象
 * @param res 响应对象
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 由于JWT是无状态的，服务端不需要做特殊处理
    // 客户端需要删除本地存储的token
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '登出成功'
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: '登出失败',
      errors: [{ type: 'auth', message: error.message || '服务器错误' }]
    };
    
    res.status(500).json(response);
  }
};

/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 确保req.user存在且有id属性
    if (!req.user || !req.user.id) {
      const response: ApiResponse = {
        success: false,
        message: '未授权',
        errors: [{ type: 'auth', message: '用户未登录或会话已过期' }]
      };
      
      res.status(401).json(response);
      return;
    }
    
    const userId = (req.user as Express.User)?.id;
    
    // 调用服务层处理业务逻辑
    const user = await userService.getUserById(userId);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '获取用户信息成功',
      data: { user }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: '获取用户信息失败',
      errors: [{ type: 'auth', message: error.message || '服务器错误' }]
    };
    
    res.status(500).json(response);
  }
};

/**
 * 更新用户资料
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // 确保req.user存在且有id属性
    if (!req.user || !req.user.id) {
      const response: ApiResponse = {
        success: false,
        message: '未授权',
        errors: [{ type: 'auth', message: '用户未登录或会话已过期' }]
      };
      
      res.status(401).json(response);
      return;
    }
    
    const userId = req.user.id;
    
    const { username, email, avatar } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.updateUserProfile(userId, { username, email, avatar });
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: '资料更新成功',
      data: { user: result.user }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const statusCode = error.message.includes('已存在') ? 409 : 400;
    const response: ApiResponse = {
      success: false,
      message: '资料更新失败',
      errors: [{ type: 'profile', message: error.message || '更新失败' }]
    };
    
    res.status(statusCode).json(response);
  }
};

/**
 * 修改密码
 * @param req 请求对象
 * @param res 响应对象
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // 确保req.user存在且有id属性
    if (!req.user || !req.user.id) {
      const response: ApiResponse = {
        success: false,
        message: '未授权',
        errors: [{ type: 'auth', message: '用户未登录或会话已过期' }]
      };
      
      res.status(401).json(response);
      return;
    }
    
    const userId = req.user.id;
    
    const { currentPassword, newPassword } = req.body;
    
    // 调用服务层处理业务逻辑
    const result = await userService.changeUserPassword(userId, currentPassword, newPassword);
    
    // 返回标准响应格式
    const response: ApiResponse = {
      success: true,
      message: result.message || '密码修改成功'
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    // 错误响应
    const response: ApiResponse = {
      success: false,
      message: '密码修改失败',
      errors: [{ type: 'password', message: error.message || '密码修改失败' }]
    };
    
    res.status(400).json(response);
  }
};

/**
 * 获取当前用户信息（别名）
 * @param req 请求对象
 * @param res 响应对象
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  return getCurrentUser(req, res);
};
