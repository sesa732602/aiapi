/**
 * 用户服务
 * 处理用户相关的业务逻辑，解耦控制器与模型的直接依赖
 */
/* eslint-env node */
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// 使用动态导入避免循环依赖
const getUserModel = async () => {
  const { User } = await import('../models/User');
  return User;
};

// JWT配置
// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const BCRYPT_SALT_ROUNDS = 12; // 增加盐轮数提高安全性

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
  user.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS); // 使用更高的盐轮数
  user.role = 'user';
  
  // 生成唯一的用户标识符
  user.uuid = uuidv4();
  
  await user.save();
  
  // 生成JWT令牌
  const token = generateToken(user);
  
  return {
    success: true,
    token,
    user: sanitizeUser(user)
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
  const token = generateToken(user);
  
  // 记录最后登录时间
  user.lastLoginAt = new Date();
  await user.save();
  
  return {
    success: true,
    token,
    user: sanitizeUser(user)
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
      // 为社交登录用户生成随机强密码
      const randomPassword = generateSecureRandomPassword();
      user.password = await bcrypt.hash(randomPassword, BCRYPT_SALT_ROUNDS);
      user.googleId = googleId;
      user.role = 'user';
      user.uuid = uuidv4();
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  }
  
  // 生成JWT令牌
  const token = generateToken(user);
  
  // 记录最后登录时间
  user.lastLoginAt = new Date();
  await user.save();
  
  return {
    success: true,
    token,
    user: sanitizeUser(user)
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
    // 为社交登录用户生成随机强密码
    const randomPassword = generateSecureRandomPassword();
    user.password = await bcrypt.hash(randomPassword, BCRYPT_SALT_ROUNDS);
    user.wechatId = wechatId;
    user.role = 'user';
    user.uuid = uuidv4();
    if (avatar) {
      user.avatar = avatar;
    }
    await user.save();
  }
  
  // 生成JWT令牌
  const token = generateToken(user);
  
  // 记录最后登录时间
  user.lastLoginAt = new Date();
  await user.save();
  
  return {
    success: true,
    token,
    user: sanitizeUser(user)
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
  
  return sanitizeUser(user);
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
    success: true,
    user: sanitizeUser(user)
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
  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();
  
  return {
    success: true,
    message: '密码修改成功'
  };
};

/**
 * 生成JWT令牌
 * @param user 用户对象
 * @returns JWT令牌
 */
const generateToken = (user: any): string => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      uuid: user.uuid // 添加uuid增强安全性
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'api-management-platform', // 添加颁发者
      subject: user.id.toString() // 添加主题
    }
  );
};

/**
 * 清理用户对象，移除敏感信息
 * @param user 用户对象
 * @returns 清理后的用户对象
 */
const sanitizeUser = (user: any) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
};

/**
 * 生成安全的随机密码
 * @returns 随机密码
 */
const generateSecureRandomPassword = (): string => {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  
  // 确保包含至少一个大写字母、小写字母、数字和特殊字符
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*()_+~`|}{[]:;?><,./-='[Math.floor(Math.random() * 30)];
  
  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};
