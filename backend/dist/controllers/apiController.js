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
exports.deleteApiPermission = exports.getApiPermissions = exports.addApiPermission = exports.setCurrentApiVersion = exports.getApiVersions = exports.createApiVersion = exports.deleteApi = exports.updateApi = exports.getApiById = exports.getApis = exports.createApi = void 0;
const apiService = __importStar(require("../services/apiService"));
/**
 * 创建API
 * @param req 请求对象
 * @param res 响应对象
 */
const createApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { name, description, path, method, teamId } = req.body;
        const userId = req.user.id;
        // 调用服务层处理业务逻辑
        const api = yield apiService.createApi(userId, { name, description, path, method, teamId });
        res.status(201).json({
            message: 'API创建成功',
            api
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API创建失败' });
    }
});
exports.createApi = createApi;
/**
 * 获取API列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getApis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { teamId } = req.query;
        // 调用服务层处理业务逻辑
        const apis = yield apiService.getApis(userId, teamId ? parseInt(teamId, 10) : undefined);
        res.status(200).json({ apis });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '获取API列表失败' });
    }
});
exports.getApis = getApis;
/**
 * 获取API详情
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        // 调用服务层处理业务逻辑
        const api = yield apiService.getApiById(apiId, userId);
        res.status(200).json({ api });
    }
    catch (error) {
        res.status(404).json({ message: error.message || 'API不存在' });
    }
});
exports.getApiById = getApiById;
/**
 * 更新API
 * @param req 请求对象
 * @param res 响应对象
 */
const updateApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        const { name, description, path, method } = req.body;
        // 调用服务层处理业务逻辑
        const api = yield apiService.updateApi(apiId, userId, { name, description, path, method });
        res.status(200).json({
            message: 'API更新成功',
            api
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API更新失败' });
    }
});
exports.updateApi = updateApi;
/**
 * 删除API
 * @param req 请求对象
 * @param res 响应对象
 */
const deleteApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        // 调用服务层处理业务逻辑
        yield apiService.deleteApi(apiId, userId);
        res.status(200).json({ message: 'API删除成功' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API删除失败' });
    }
});
exports.deleteApi = deleteApi;
/**
 * 创建API版本
 * @param req 请求对象
 * @param res 响应对象
 */
const createApiVersion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        const { version, description, spec } = req.body;
        // 调用服务层处理业务逻辑
        const apiVersion = yield apiService.createApiVersion(apiId, userId, { version, description, spec });
        res.status(201).json({
            message: 'API版本创建成功',
            apiVersion
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API版本创建失败' });
    }
});
exports.createApiVersion = createApiVersion;
/**
 * 获取API版本列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiVersions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        // 调用服务层处理业务逻辑
        const versions = yield apiService.getApiVersions(apiId, userId);
        res.status(200).json({ versions });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '获取API版本列表失败' });
    }
});
exports.getApiVersions = getApiVersions;
/**
 * 设置当前API版本
 * @param req 请求对象
 * @param res 响应对象
 */
const setCurrentApiVersion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        const versionId = parseInt(req.params.versionId, 10);
        // 调用服务层处理业务逻辑
        const result = yield apiService.setCurrentApiVersion(apiId, versionId, userId);
        res.status(200).json({
            message: '当前版本设置成功',
            api: result
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '设置当前版本失败' });
    }
});
exports.setCurrentApiVersion = setCurrentApiVersion;
/**
 * 添加API权限
 * @param req 请求对象
 * @param res 响应对象
 */
const addApiPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        const { type, targetId } = req.body;
        // 调用服务层处理业务逻辑
        const permission = yield apiService.addApiPermission(apiId, userId, { type, targetId });
        res.status(201).json({
            message: 'API权限添加成功',
            permission
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API权限添加失败' });
    }
});
exports.addApiPermission = addApiPermission;
/**
 * 获取API权限列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        // 调用服务层处理业务逻辑
        const permissions = yield apiService.getApiPermissions(apiId, userId);
        res.status(200).json({ permissions });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '获取API权限列表失败' });
    }
});
exports.getApiPermissions = getApiPermissions;
/**
 * 删除API权限
 * @param req 请求对象
 * @param res 响应对象
 */
const deleteApiPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const apiId = parseInt(req.params.id, 10);
        const permissionId = parseInt(req.params.permissionId, 10);
        // 调用服务层处理业务逻辑
        yield apiService.deleteApiPermission(apiId, permissionId, userId);
        res.status(200).json({ message: 'API权限删除成功' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'API权限删除失败' });
    }
});
exports.deleteApiPermission = deleteApiPermission;
