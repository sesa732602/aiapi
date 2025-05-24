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
exports.getMe = exports.wechatLogin = exports.googleLogin = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
/**
 * 用户注册
 * @param req 请求对象
 * @param res 响应对象
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // 检查用户名是否已存在
        const existingUserByUsername = yield User_1.User.findOne({ where: { username } });
        if (existingUserByUsername) {
            res.status(400).json({ message: '用户名已存在' });
            return;
        }
        // 检查邮箱是否已存在
        const existingUserByEmail = yield User_1.User.findOne({ where: { email } });
        if (existingUserByEmail) {
            res.status(400).json({ message: '邮箱已存在' });
            return;
        }
        // 创建新用户
        const user = new User_1.User();
        user.username = username;
        user.email = email;
        user.password = yield bcrypt.hash(password, 10);
        user.role = User_1.UserRole.USER;
        yield user.save();
        // 生成JWT令牌
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        // 查找用户
        const user = yield User_1.User.findOne({ where: { username } });
        if (!user) {
            res.status(401).json({ message: '用户名或密码错误' });
            return;
        }
        // 验证密码
        const isPasswordValid = yield bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: '用户名或密码错误' });
            return;
        }
        // 生成JWT令牌
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        // 查找用户
        let user = yield User_1.User.findOne({ where: { googleId } });
        if (!user) {
            // 检查邮箱是否已存在
            user = yield User_1.User.findOne({ where: { email } });
            if (user) {
                // 更新Google ID
                user.googleId = googleId;
                if (avatar) {
                    user.avatar = avatar;
                }
                yield user.save();
            }
            else {
                // 创建新用户
                user = new User_1.User();
                user.username = `google_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
                user.email = email;
                user.password = yield bcrypt.hash(Math.random().toString(36).slice(-8), 10);
                user.googleId = googleId;
                user.role = User_1.UserRole.USER;
                if (avatar) {
                    user.avatar = avatar;
                }
                yield user.save();
            }
        }
        // 生成JWT令牌
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        // 查找用户
        let user = yield User_1.User.findOne({ where: { wechatId } });
        if (!user) {
            // 创建新用户
            user = new User_1.User();
            user.username = `wechat_${nickname.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
            user.email = `${user.username}@wechat.user`;
            user.password = yield bcrypt.hash(Math.random().toString(36).slice(-8), 10);
            user.wechatId = wechatId;
            user.role = User_1.UserRole.USER;
            if (avatar) {
                user.avatar = avatar;
            }
            yield user.save();
        }
        // 生成JWT令牌
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
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
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.wechatLogin = wechatLogin;
/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // 查找用户
        const user = yield User_1.User.findOne({ where: { id: userId } });
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
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getMe = getMe;
