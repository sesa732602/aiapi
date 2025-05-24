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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeApiPermission = exports.addApiPermission = exports.getApiPermissions = exports.setCurrentApiVersion = exports.getApiVersions = exports.createApiVersion = exports.deleteApi = exports.updateApi = exports.getApiById = exports.getApis = exports.createApi = void 0;
const Api_1 = require("../models/Api");
const ApiVersion_1 = require("../models/ApiVersion");
const ApiPermission_1 = require("../models/ApiPermission");
const Team_1 = require("../models/Team");
const TeamMember_1 = require("../models/TeamMember");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
/**
 * 创建API
 * @param req 请求对象
 * @param res 响应对象
 */
const createApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, path, method, teamId } = req.body;
        const userId = req.user.id;
        // 检查API名称是否已存在
        const existingApi = yield Api_1.Api.findOne({ where: { name } });
        if (existingApi) {
            res.status(400).json({ message: 'API名称已存在' });
            return;
        }
        // 如果指定了团队，检查团队是否存在以及用户是否有权限
        if (teamId) {
            const teamIdNum = parseInt(teamId, 10);
            const team = yield Team_1.Team.findOne({ where: { id: teamIdNum } });
            if (!team) {
                res.status(404).json({ message: '团队不存在' });
                return;
            }
            // 检查用户是否有权限在该团队创建API
            if (req.user.role !== 'super_admin') {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: teamIdNum, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    res.status(403).json({ message: '无权在该团队创建API' });
                    return;
                }
            }
        }
        // 创建新API
        const api = new Api_1.Api();
        api.name = name;
        api.description = description;
        api.path = path;
        api.method = method;
        api.teamId = teamId ? parseInt(teamId, 10) : null;
        api.createdBy = userId;
        yield api.save();
        // 创建初始版本
        const apiVersion = new ApiVersion_1.ApiVersion();
        apiVersion.apiId = api.id;
        apiVersion.version = '1.0.0';
        apiVersion.description = '初始版本';
        apiVersion.isCurrent = true;
        yield apiVersion.save();
        // 为创建者添加管理权限
        const apiPermission = new ApiPermission_1.ApiPermission();
        apiPermission.apiId = api.id;
        apiPermission.userId = userId;
        apiPermission.permissionType = ApiPermission_1.ApiPermissionType.ADMIN;
        yield apiPermission.save();
        res.status(201).json({
            message: 'API创建成功',
            api: {
                id: api.id,
                name: api.name,
                description: api.description,
                path: api.path,
                method: api.method,
                teamId: api.teamId,
                createdAt: api.createdAt,
                version: apiVersion.version
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const userId = req.user.id;
        const { teamId, mine } = req.query;
        let apis = [];
        if (req.user.role === 'super_admin') {
            // 超级管理员可以查看所有API
            if (teamId) {
                const teamIdNum = parseInt(teamId, 10);
                apis = yield Api_1.Api.find({ where: { teamId: teamIdNum } });
            }
            else if (mine === 'true') {
                apis = yield Api_1.Api.find({ where: { createdBy: userId } });
            }
            else {
                apis = yield Api_1.Api.find();
            }
        }
        else {
            // 普通用户只能查看自己有权限的API
            if (teamId) {
                const teamIdNum = parseInt(teamId, 10);
                // 检查用户是否是团队成员
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: teamIdNum, userId } });
                if (teamMember) {
                    apis = yield Api_1.Api.find({ where: { teamId: teamIdNum } });
                }
                else {
                    // 获取用户在该团队有权限的API
                    const permissions = yield ApiPermission_1.ApiPermission.find({ where: { userId } });
                    const apiIds = permissions.map(permission => permission.apiId);
                    if (apiIds.length > 0) {
                        apis = yield Api_1.Api.find({ where: { id: (0, typeorm_1.In)(apiIds), teamId: teamIdNum } });
                    }
                }
            }
            else if (mine === 'true') {
                apis = yield Api_1.Api.find({ where: { createdBy: userId } });
            }
            else {
                // 获取用户有权限的API
                const permissions = yield ApiPermission_1.ApiPermission.find({ where: { userId } });
                const apiIds = permissions.map(permission => permission.apiId);
                // 获取用户所在团队的API
                const teamMembers = yield TeamMember_1.TeamMember.find({ where: { userId } });
                const teamIds = teamMembers.map(member => member.teamId);
                let teamApis = [];
                if (teamIds.length > 0) {
                    teamApis = yield Api_1.Api.find({ where: { teamId: (0, typeorm_1.In)(teamIds) } });
                }
                // 合并结果
                const allApiIds = new Set([...apiIds, ...teamApis.map(api => api.id)]);
                const allApiIdsArray = Array.from(allApiIds);
                if (allApiIdsArray.length > 0) {
                    apis = yield Api_1.Api.find({ where: { id: (0, typeorm_1.In)(allApiIdsArray) } });
                }
            }
        }
        // 获取API当前版本
        const apiDetails = yield Promise.all(apis.map((api) => __awaiter(void 0, void 0, void 0, function* () {
            const currentVersion = yield ApiVersion_1.ApiVersion.findOne({ where: { apiId: api.id, isCurrent: true } });
            return Object.assign(Object.assign({}, api), { currentVersion: currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.version });
        })));
        res.status(200).json(apiDetails);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限查看该API
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的成员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember) {
                    // 检查用户是否有API权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权查看该API' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权查看该API' });
                    return;
                }
            }
        }
        // 获取API版本
        const versions = yield ApiVersion_1.ApiVersion.find({ where: { apiId: id } });
        // 获取API权限
        const permissions = yield ApiPermission_1.ApiPermission.find({ where: { apiId: id } });
        // 获取权限用户信息
        const permissionDetails = yield Promise.all(permissions.map((permission) => __awaiter(void 0, void 0, void 0, function* () {
            if (permission.userId) {
                const user = yield User_1.User.findOne({ where: { id: permission.userId } });
                return Object.assign(Object.assign({}, permission), { username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email });
            }
            else if (permission.teamId) {
                const team = yield Team_1.Team.findOne({ where: { id: permission.teamId } });
                return Object.assign(Object.assign({}, permission), { teamName: team === null || team === void 0 ? void 0 : team.name });
            }
            return permission;
        })));
        res.status(200).json(Object.assign(Object.assign({}, api), { versions, permissions: permissionDetails }));
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getApiById = getApiById;
/**
 * 更新API信息
 * @param req 请求对象
 * @param res 响应对象
 */
const updateApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description, path, method } = req.body;
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限更新该API
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权更新该API' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权更新该API' });
                    return;
                }
            }
        }
        // 检查API名称是否已被其他API使用
        if (name && name !== api.name) {
            const existingApi = yield Api_1.Api.findOne({ where: { name } });
            if (existingApi) {
                res.status(400).json({ message: 'API名称已存在' });
                return;
            }
            api.name = name;
        }
        if (description) {
            api.description = description;
        }
        if (path) {
            api.path = path;
        }
        if (method) {
            api.method = method;
        }
        yield api.save();
        res.status(200).json({
            message: 'API更新成功',
            api
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限删除该API
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的拥有者
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || teamMember.role !== 'owner') {
                    res.status(403).json({ message: '无权删除该API' });
                    return;
                }
            }
            else {
                res.status(403).json({ message: '无权删除该API' });
                return;
            }
        }
        // 删除API版本
        yield ApiVersion_1.ApiVersion.delete({ apiId: id });
        // 删除API权限
        yield ApiPermission_1.ApiPermission.delete({ apiId: id });
        // 删除API
        yield Api_1.Api.delete({ id });
        res.status(200).json({ message: 'API删除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const id = parseInt(req.params.id, 10);
        const { version, description, isCurrent } = req.body;
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限创建版本
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权创建API版本' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权创建API版本' });
                    return;
                }
            }
        }
        // 检查版本号是否已存在
        const existingVersion = yield ApiVersion_1.ApiVersion.findOne({ where: { apiId: id, version } });
        if (existingVersion) {
            res.status(400).json({ message: '版本号已存在' });
            return;
        }
        // 创建新版本
        const apiVersion = new ApiVersion_1.ApiVersion();
        apiVersion.apiId = id;
        apiVersion.version = version;
        apiVersion.description = description;
        apiVersion.isCurrent = isCurrent || false;
        yield apiVersion.save();
        // 如果设置为当前版本，更新其他版本
        if (isCurrent) {
            yield ApiVersion_1.ApiVersion.update({ apiId: id, id: apiVersion.id }, { isCurrent: false });
            apiVersion.isCurrent = true;
            yield apiVersion.save();
        }
        res.status(201).json({
            message: 'API版本创建成功',
            version: apiVersion
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const id = parseInt(req.params.id, 10);
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 获取API版本
        const versions = yield ApiVersion_1.ApiVersion.find({ where: { apiId: id } });
        res.status(200).json(versions);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
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
        const id = parseInt(req.params.id, 10);
        const versionId = parseInt(req.params.versionId, 10);
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查版本是否存在
        const apiVersion = yield ApiVersion_1.ApiVersion.findOne({ where: { id: versionId, apiId: id } });
        if (!apiVersion) {
            res.status(404).json({ message: 'API版本不存在' });
            return;
        }
        // 检查用户是否有权限设置当前版本
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权设置API当前版本' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权设置API当前版本' });
                    return;
                }
            }
        }
        // 更新所有版本为非当前版本
        yield ApiVersion_1.ApiVersion.update({ apiId: id }, { isCurrent: false });
        // 设置指定版本为当前版本
        apiVersion.isCurrent = true;
        yield apiVersion.save();
        res.status(200).json({
            message: 'API当前版本设置成功',
            version: apiVersion
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.setCurrentApiVersion = setCurrentApiVersion;
/**
 * 获取API权限列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限查看API权限
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权查看API权限' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权查看API权限' });
                    return;
                }
            }
        }
        // 获取API权限
        const permissions = yield ApiPermission_1.ApiPermission.find({ where: { apiId: id } });
        // 获取权限用户信息
        const permissionDetails = yield Promise.all(permissions.map((permission) => __awaiter(void 0, void 0, void 0, function* () {
            if (permission.userId) {
                const user = yield User_1.User.findOne({ where: { id: permission.userId } });
                return Object.assign(Object.assign({}, permission), { username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email });
            }
            else if (permission.teamId) {
                const team = yield Team_1.Team.findOne({ where: { id: permission.teamId } });
                return Object.assign(Object.assign({}, permission), { teamName: team === null || team === void 0 ? void 0 : team.name });
            }
            return permission;
        })));
        res.status(200).json(permissionDetails);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getApiPermissions = getApiPermissions;
/**
 * 添加API权限
 * @param req 请求对象
 * @param res 响应对象
 */
const addApiPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { userId, teamId, permissionType } = req.body;
        const currentUserId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限添加API权限
        if (req.user.role !== 'super_admin' && api.createdBy !== currentUserId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId: currentUserId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId: currentUserId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权添加API权限' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId: currentUserId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权添加API权限' });
                    return;
                }
            }
        }
        // 检查权限类型是否有效
        if (!Object.values(ApiPermission_1.ApiPermissionType).includes(permissionType)) {
            res.status(400).json({ message: '无效的权限类型' });
            return;
        }
        // 检查用户或团队是否存在
        if (userId) {
            const userIdNum = parseInt(userId, 10);
            const user = yield User_1.User.findOne({ where: { id: userIdNum } });
            if (!user) {
                res.status(404).json({ message: '用户不存在' });
                return;
            }
            // 检查权限是否已存在
            const existingPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId: userIdNum } });
            if (existingPermission) {
                res.status(400).json({ message: '用户已有该API权限' });
                return;
            }
            // 添加用户权限
            const apiPermission = new ApiPermission_1.ApiPermission();
            apiPermission.apiId = id;
            apiPermission.userId = userIdNum;
            apiPermission.permissionType = permissionType;
            yield apiPermission.save();
            res.status(201).json({
                message: 'API权限添加成功',
                permission: Object.assign(Object.assign({}, apiPermission), { username: user.username, email: user.email })
            });
        }
        else if (teamId) {
            const teamIdNum = parseInt(teamId, 10);
            const team = yield Team_1.Team.findOne({ where: { id: teamIdNum } });
            if (!team) {
                res.status(404).json({ message: '团队不存在' });
                return;
            }
            // 检查权限是否已存在
            const existingPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, teamId: teamIdNum } });
            if (existingPermission) {
                res.status(400).json({ message: '团队已有该API权限' });
                return;
            }
            // 添加团队权限
            const apiPermission = new ApiPermission_1.ApiPermission();
            apiPermission.apiId = id;
            apiPermission.teamId = teamIdNum;
            apiPermission.permissionType = permissionType;
            yield apiPermission.save();
            res.status(201).json({
                message: 'API权限添加成功',
                permission: Object.assign(Object.assign({}, apiPermission), { teamName: team.name })
            });
        }
        else {
            res.status(400).json({ message: '必须指定用户或团队' });
        }
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.addApiPermission = addApiPermission;
/**
 * 移除API权限
 * @param req 请求对象
 * @param res 响应对象
 */
const removeApiPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const permissionId = parseInt(req.params.permissionId, 10);
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查权限是否存在
        const permission = yield ApiPermission_1.ApiPermission.findOne({ where: { id: permissionId, apiId: id } });
        if (!permission) {
            res.status(404).json({ message: 'API权限不存在' });
            return;
        }
        // 检查用户是否有权限移除API权限
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权移除API权限' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({ where: { apiId: id, userId, permissionType: ApiPermission_1.ApiPermissionType.ADMIN } });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权移除API权限' });
                    return;
                }
            }
        }
        // 移除权限
        yield ApiPermission_1.ApiPermission.delete({ id: permissionId });
        res.status(200).json({ message: 'API权限移除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.removeApiPermission = removeApiPermission;
