/**
 * 用户服务
 * 处理用户相关的业务逻辑，解耦控制器与模型的直接依赖
 */
/* eslint-env node */
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// 使用动态导入避免循环依赖
const getUserModel = async () => {
  const { User } = await import('../models/User');
  return User;
};

// JWT密钥
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 用户注册
 */
export const registerUser = async (username: string, email: string, password: string) => {
  const User = await getUserModel();
  
  // 检查用户名是否已存在
  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) {
    throw new Error('用户名已存在');
  }
  
  // 检查邮箱是否已存在
  const existingUserByEmail = await User.findOne({ where: { email } });
  if (existingUserByEmail) {
    throw new Error('邮箱已存在');
  }
  
  // 创建新用户
  const user = new User();
  user.username = username;
  user.email = email;
  user.password = await bcrypt.hash(password, 10);
  user.role = 'user';
  await user.save();
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * 用户登录
 */
export const loginUser = async (username: string, password: string) => {
  const User = await getUserModel();
  
  // 查找用户
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new Error('用户名或密码错误');
  }
  
  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Google登录
 */
export const googleLoginUser = async (googleId: string, email: string, name: string, avatar?: string) => {
  const User = await getUserModel();
  
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
      user.role = 'user';
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  };
};

/**
 * 微信登录
 */
export const wechatLoginUser = async (wechatId: string, nickname: string, avatar?: string) => {
  const User = await getUserModel();
  
  // 查找用户
  let user = await User.findOne({ where: { wechatId } });
  
  if (!user) {
    // 创建新用户
    user = new User();
    user.username = `wechat_${nickname.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    user.email = `${user.username}@wechat.user`;
    user.password = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
    user.wechatId = wechatId;
    user.role = 'user';
    if (avatar) {
      user.avatar = avatar;
    }
    await user.save();
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  };
};

/**
 * 获取用户信息
 */
export const getUserById = async (userId: number) => {
  const User = await getUserModel();
  
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt
  };
};

/**
 * 更新用户资料
 */
export const updateUserProfile = async (userId: number, data: { username?: string; email?: string; avatar?: string }) => {
  const User = await getUserModel();
  
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }
  
  // 检查用户名是否已存在
  if (data.username && data.username !== user.username) {
    const existingUser = await User.findOne({ where: { username: data.username } });
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    user.username = data.username;
  }
  
  // 检查邮箱是否已存在
  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('邮箱已存在');
    }
    user.email = data.email;
  }
  
  // 更新头像
  if (data.avatar) {
    user.avatar = data.avatar;
  }
  
  await user.save();
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };
};

/**
 * 修改密码
 */
export const changeUserPassword = async (userId: number, currentPassword: string, newPassword: string) => {
  const User = await getUserModel();
  
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }
  
  // 验证当前密码
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('当前密码错误');
  }
  
  // 更新密码
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  
  return true;
};
