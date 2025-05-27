"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.changePassword = exports.updateProfile = exports.getCurrentUser = exports.logout = exports.wechatLogin = exports.googleLogin = exports.login = exports.register = void 0;
const userService = __importStar(require("../services/userService"));
/**
 * 用户注册
 * @param req 请求对象
 * @param res 响应对象
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // 调用服务层处理业务逻辑
        const result = yield userService.registerUser(username, email, password);
        // 返回标准响应格式
        const response = {
            success: true,
            message: '注册成功',
            data: {
                token: result.token,
                user: result.user
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: error.message || '注册失败',
            errors: [{ type: 'auth', message: error.message || '服务器错误' }]
        };
        // 根据错误类型设置状态码
        const statusCode = error.message.includes('已存在') ? 409 : 500;
        res.status(statusCode).json(response);
    }
});
exports.register = register;
/**
 * 用户登录
 * @param req 请求对象
 * @param res 响应对象
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // 调用服务层处理业务逻辑
        const result = yield userService.loginUser(username, password);
        // 返回标准响应格式
        const response = {
            success: true,
            message: '登录成功',
            data: {
                token: result.token,
                user: result.user
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: '登录失败',
            errors: [{ type: 'auth', message: error.message || '用户名或密码错误' }]
        };
        res.status(401).json(response);
    }
});
exports.login = login;
/**
 * Google登录
 * @param req 请求对象
 * @param res 响应对象
 */
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { googleId, email, name, avatar } = req.body;
        // 调用服务层处理业务逻辑
        const result = yield userService.googleLoginUser(googleId, email, name, avatar);
        // 返回标准响应格式
        const response = {
            success: true,
            message: 'Google登录成功',
            data: {
                token: result.token,
                user: result.user
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: 'Google登录失败',
            errors: [{ type: 'auth', message: error.message || '服务器错误' }]
        };
        res.status(500).json(response);
    }
});
exports.googleLogin = googleLogin;
/**
 * 微信登录
 * @param req 请求对象
 * @param res 响应对象
 */
const wechatLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wechatId, nickname, avatar } = req.body;
        // 调用服务层处理业务逻辑
        const result = yield userService.wechatLoginUser(wechatId, nickname, avatar);
        // 返回标准响应格式
        const response = {
            success: true,
            message: '微信登录成功',
            data: {
                token: result.token,
                user: result.user
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: '微信登录失败',
            errors: [{ type: 'auth', message: error.message || '服务器错误' }]
        };
        res.status(500).json(response);
    }
});
exports.wechatLogin = wechatLogin;
/**
 * 用户登出
 * @param req 请求对象
 * @param res 响应对象
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 由于JWT是无状态的，服务端不需要做特殊处理
        // 客户端需要删除本地存储的token
        // 返回标准响应格式
        const response = {
            success: true,
            message: '登出成功'
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: '登出失败',
            errors: [{ type: 'auth', message: error.message || '服务器错误' }]
        };
        res.status(500).json(response);
    }
});
exports.logout = logout;
/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 确保req.user存在且有id属性
        if (!req.user || !req.user.id) {
            const response = {
                success: false,
                message: '未授权',
                errors: [{ type: 'auth', message: '用户未登录或会话已过期' }]
            };
            res.status(401).json(response);
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // 调用服务层处理业务逻辑
        const user = yield userService.getUserById(userId);
        // 返回标准响应格式
        const response = {
            success: true,
            message: '获取用户信息成功',
            data: { user }
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: '获取用户信息失败',
            errors: [{ type: 'auth', message: error.message || '服务器错误' }]
        };
        res.status(500).json(response);
    }
});
exports.getCurrentUser = getCurrentUser;
/**
 * 更新用户资料
 * @param req 请求对象
 * @param res 响应对象
 */
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 确保req.user存在且有id属性
        if (!req.user || !req.user.id) {
            const response = {
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
        const result = yield userService.updateUserProfile(userId, { username, email, avatar });
        // 返回标准响应格式
        const response = {
            success: true,
            message: '资料更新成功',
            data: { user: result.user }
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const statusCode = error.message.includes('已存在') ? 409 : 400;
        const response = {
            success: false,
            message: '资料更新失败',
            errors: [{ type: 'profile', message: error.message || '更新失败' }]
        };
        res.status(statusCode).json(response);
    }
});
exports.updateProfile = updateProfile;
/**
 * 修改密码
 * @param req 请求对象
 * @param res 响应对象
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 确保req.user存在且有id属性
        if (!req.user || !req.user.id) {
            const response = {
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
        const result = yield userService.changeUserPassword(userId, currentPassword, newPassword);
        // 返回标准响应格式
        const response = {
            success: true,
            message: result.message || '密码修改成功'
        };
        res.status(200).json(response);
    }
    catch (error) {
        // 错误响应
        const response = {
            success: false,
            message: '密码修改失败',
            errors: [{ type: 'password', message: error.message || '密码修改失败' }]
        };
        res.status(400).json(response);
    }
});
exports.changePassword = changePassword;
/**
 * 获取当前用户信息（别名）
 * @param req 请求对象
 * @param res 响应对象
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.getCurrentUser)(req, res);
});
exports.getMe = getMe;
