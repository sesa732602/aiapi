"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireSuperAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * JWT认证中间件
 * 验证请求头中的token是否有效
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: '未提供认证令牌' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: '无效的认证令牌' });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * 超级管理员权限中间件
 * 验证用户是否具有超级管理员权限
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: '未认证的用户' });
        return;
    }
    if (req.user.role !== 'super_admin') {
        res.status(403).json({ message: '需要超级管理员权限' });
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
/**
 * 管理员权限中间件
 * 验证用户是否具有管理员或超级管理员权限
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: '未认证的用户' });
        return;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        res.status(403).json({ message: '需要管理员权限' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
