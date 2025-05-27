"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiOwner = exports.isAdmin = exports.authMiddleware = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const typeorm_1 = require("typeorm");
/* eslint-disable no-undef */
/* eslint-env node */
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
/**
 * 验证JWT令牌
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: '令牌无效或已过期' });
                return;
            }
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({ message: '未提供认证令牌' });
    }
};
exports.authenticateJWT = authenticateJWT;
// 导出为authMiddleware以匹配路由中的引用
exports.authMiddleware = exports.authenticateJWT;
/**
 * 验证用户是否为管理员
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: '需要管理员权限' });
    }
};
exports.isAdmin = isAdmin;
/**
 * 验证用户是否为API所有者
 */
const isApiOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const apiId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(403).json({ message: '未授权' });
            return;
        }
        const apiRepository = (0, typeorm_1.getRepository)('Api');
        const api = yield apiRepository.findOne({ where: { id: apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        if (api.ownerId === userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin') {
            next();
        }
        else {
            res.status(403).json({ message: '您不是此API的所有者' });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    }
    catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});
exports.isApiOwner = isApiOwner;
