/**
 * 用户认证控制器
 */
import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

/**
 * 用户注册
 * @param req 请求对象
 * @param res 响应对象
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户名是否已存在
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      res.status(400).json({ message: '用户名已存在' });
      return;
    }
    
    // 检查邮箱是否已存在
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      res.status(400).json({ message: '邮箱已存在' });
      return;
    }
    
    // 创建新用户
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.role = UserRole.USER;
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
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
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ message: '用户名或密码错误' });
      return;
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: '用户名或密码错误' });
      return;
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
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
    
    // 查找用户
    let user = await User.findOne({ where: { googleId } });
    
    if (!user) {
      // 检查邮箱是否已存在
      user = await User.findOne({ where: { email } });
      
      if (user) {
        // 更新Google ID
        user.googleId = googleId;
        if (avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        // 创建新用户
        user = new User();
        user.username = `google_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
        user.email = email;
        user.password = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        user.googleId = googleId;
        user.role = UserRole.USER;
        if (avatar) {
          user.avatar = avatar;
        }
        await user.save();
      }
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Google登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
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
    
    // 查找用户
    let user = await User.findOne({ where: { wechatId } });
    
    if (!user) {
      // 创建新用户
      user = new User();
      user.username = `wechat_${nickname.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      user.email = `${user.username}@wechat.user`;
      user.password = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      user.wechatId = wechatId;
      user.role = UserRole.USER;
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: '微信登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // 查找用户
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
