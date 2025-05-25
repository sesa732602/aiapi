/**
 * 用户认证控制器
 */
import { Request, Response } from 'express';
import * as userService from '../services/userService';

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
    
    res.status(201).json({
      message: '注册成功',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '服务器错误' });
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
    
    res.status(200).json({
      message: '登录成功',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || '用户名或密码错误' });
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
    
    res.status(200).json({
      message: 'Google登录成功',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '服务器错误' });
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
    
    res.status(200).json({
      message: '微信登录成功',
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '服务器错误' });
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
    res.status(200).json({ message: '登出成功' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '服务器错误' });
  }
};

/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const user = await userService.getUserById(userId);
    
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '服务器错误' });
  }
};

/**
 * 更新用户资料
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { username, email, avatar } = req.body;
    
    // 调用服务层处理业务逻辑
    const user = await userService.updateUserProfile(userId, { username, email, avatar });
    
    res.status(200).json({
      message: '资料更新成功',
      user
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '更新失败' });
  }
};

/**
 * 修改密码
 * @param req 请求对象
 * @param res 响应对象
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // 调用服务层处理业务逻辑
    await userService.changeUserPassword(userId, currentPassword, newPassword);
    
    res.status(200).json({ message: '密码修改成功' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '密码修改失败' });
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
