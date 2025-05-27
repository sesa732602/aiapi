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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./types/index.d.ts" />
//
/**
 * 应用入口文件
 */
/* eslint-env node */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// 加载环境变量
dotenv_1.default.config();
const database_1 = require("./database");
// 创建Express应用
const app = (0, express_1.default)();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 初始化数据库并启动服务器
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 初始化数据库连接
        const dbInitialized = yield (0, database_1.initializeDatabase)();
        if (!dbInitialized) {
            // eslint-disable-next-line no-undef
            console.error('数据库初始化失败，服务器无法启动');
            // eslint-disable-next-line no-undef
            process.exit(1);
        }
        // 动态导入路由，避免循环依赖
        const { default: routes } = yield Promise.resolve().then(() => __importStar(require('./routes')));
        // API路由
        app.use('/api', routes);
        // 404处理中间件 - 确保未匹配的API路由返回JSON而非HTML
        app.use('/api/*', (req, res) => {
            res.status(404).json({
                success: false,
                message: '未找到请求的API资源',
                path: req.originalUrl
            });
        });
        // 全局错误处理中间件 - 确保所有API异常都返回JSON
        app.use((err, req, res, next) => {
            // eslint-disable-next-line no-undef
            console.error('服务器错误:', err);
            // 只处理API请求的错误
            if (req.originalUrl.startsWith('/api')) {
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误',
                    error: process.env.NODE_ENV === 'production' ? undefined : err.message
                });
            }
            else {
                next(err);
            }
        });
        // 启动服务器
        app.listen(port, () => {
            // eslint-disable-next-line no-undef
            console.log(`服务器运行在 http://localhost:${port}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-undef
        console.error('服务器启动失败:', error);
        // eslint-disable-next-line no-undef
        process.exit(1);
    }
});
startServer();
