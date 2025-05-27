/**
 * 认证相关的输入验证规则
 */
import { body } from 'express-validator';

/**
 * 用户注册验证规则
 */
export const registerValidation = [
  // 用户名验证
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线')
    .trim(),
  
  // 邮箱验证
  body('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  // 密码验证
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 8 }).withMessage('密码长度不能少于8个字符')
    .matches(/[A-Z]/).withMessage('密码必须包含至少一个大写字母')
    .matches(/[a-z]/).withMessage('密码必须包含至少一个小写字母')
    .matches(/[0-9]/).withMessage('密码必须包含至少一个数字')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('密码必须包含至少一个特殊字符')
];

/**
 * 用户登录验证规则
 */
export const loginValidation = [
  // 用户名验证
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .trim(),
  
  // 密码验证
  body('password')
    .notEmpty().withMessage('密码不能为空')
];

/**
 * Google登录验证规则
 */
export const googleLoginValidation = [
  body('googleId')
    .notEmpty().withMessage('Google ID不能为空'),
  
  body('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  
  body('name')
    .notEmpty().withMessage('名称不能为空')
];

/**
 * 微信登录验证规则
 */
export const wechatLoginValidation = [
  body('wechatId')
    .notEmpty().withMessage('微信ID不能为空'),
  
  body('nickname')
    .notEmpty().withMessage('昵称不能为空')
];

/**
 * 修改密码验证规则
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('当前密码不能为空'),
  
  body('newPassword')
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 8 }).withMessage('新密码长度不能少于8个字符')
    .matches(/[A-Z]/).withMessage('新密码必须包含至少一个大写字母')
    .matches(/[a-z]/).withMessage('新密码必须包含至少一个小写字母')
    .matches(/[0-9]/).withMessage('新密码必须包含至少一个数字')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('新密码必须包含至少一个特殊字符')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('新密码不能与当前密码相同');
      }
      return true;
    })
];

/**
 * 更新用户资料验证规则
 */
export const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线')
    .trim(),
  
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('avatar')
    .optional()
    .isURL().withMessage('头像必须是有效的URL')
];
