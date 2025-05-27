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
exports.getInvitableUsers = exports.leaveTeam = exports.removeTeamMember = exports.updateTeamMemberRole = exports.addTeamMember = exports.getTeamMembers = exports.deleteTeam = exports.updateTeam = exports.getTeamDetails = exports.getUserTeam = exports.createTeam = void 0;
const teamService = __importStar(require("../services/teamService"));
/**
 * 创建团队
 * @param req 请求对象
 * @param res 响应对象
 */
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        // 调用服务层处理业务逻辑
        const team = yield teamService.createTeam(name, description, userId);
        res.status(201).json({
            message: '团队创建成功',
            team
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '团队创建失败' });
    }
});
exports.createTeam = createTeam;
/**
 * 获取用户所在的团队
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        // 调用服务层处理业务逻辑
        const teams = yield teamService.getUserTeams(userId);
        res.status(200).json({ teams });
    }
    catch (error) {
        res.status(500).json({ message: error.message || '获取团队失败' });
    }
});
exports.getUserTeam = getUserTeam;
/**
 * 获取团队详情
 * @param req 请求对象
 * @param res 响应对象
 */
const getTeamDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId } = req.query;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        const team = yield teamService.getTeamDetails(parseInt(teamId, 10), userId);
        res.status(200).json({ team });
    }
    catch (error) {
        res.status(404).json({ message: error.message || '获取团队详情失败' });
    }
});
exports.getTeamDetails = getTeamDetails;
/**
 * 更新团队信息
 * @param req 请求对象
 * @param res 响应对象
 */
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId, name, description } = req.body;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        const team = yield teamService.updateTeam(parseInt(teamId, 10), userId, { name, description });
        res.status(200).json({
            message: '团队更新成功',
            team
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '团队更新失败' });
    }
});
exports.updateTeam = updateTeam;
/**
 * 删除团队
 * @param req 请求对象
 * @param res 响应对象
 */
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId } = req.body;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        yield teamService.deleteTeam(parseInt(teamId, 10), userId);
        res.status(200).json({ message: '团队删除成功' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '团队删除失败' });
    }
});
exports.deleteTeam = deleteTeam;
/**
 * 获取团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
const getTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId } = req.query;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        const members = yield teamService.getTeamMembers(parseInt(teamId, 10), userId);
        res.status(200).json({ members });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '获取团队成员失败' });
    }
});
exports.getTeamMembers = getTeamMembers;
/**
 * 添加团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
const addTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId, email, role } = req.body;
        if (!teamId || !email) {
            res.status(400).json({ message: '缺少必要参数' });
            return;
        }
        // 调用服务层处理业务逻辑
        const member = yield teamService.addTeamMember(parseInt(teamId, 10), userId, email, role || 'member');
        res.status(201).json({
            message: '成员添加成功',
            member
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '添加团队成员失败' });
    }
});
exports.addTeamMember = addTeamMember;
/**
 * 更新团队成员角色
 * @param req 请求对象
 * @param res 响应对象
 */
const updateTeamMemberRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId, role } = req.body;
        const memberId = parseInt(req.params.memberId, 10);
        if (!teamId || !role) {
            res.status(400).json({ message: '缺少必要参数' });
            return;
        }
        // 调用服务层处理业务逻辑
        const member = yield teamService.updateTeamMemberRole(parseInt(teamId, 10), userId, memberId, role);
        res.status(200).json({
            message: '成员角色更新成功',
            member
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '更新成员角色失败' });
    }
});
exports.updateTeamMemberRole = updateTeamMemberRole;
/**
 * 移除团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId } = req.body;
        const memberId = parseInt(req.params.memberId, 10);
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        yield teamService.removeTeamMember(parseInt(teamId, 10), userId, memberId);
        res.status(200).json({ message: '成员移除成功' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '移除成员失败' });
    }
});
exports.removeTeamMember = removeTeamMember;
/**
 * 离开团队
 * @param req 请求对象
 * @param res 响应对象
 */
const leaveTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId } = req.body;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        yield teamService.leaveTeam(parseInt(teamId, 10), userId);
        res.status(200).json({ message: '已成功离开团队' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '离开团队失败' });
    }
});
exports.leaveTeam = leaveTeam;
/**
 * 获取可邀请的用户
 * @param req 请求对象
 * @param res 响应对象
 */
const getInvitableUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { teamId, query } = req.query;
        if (!teamId) {
            res.status(400).json({ message: '缺少团队ID' });
            return;
        }
        // 调用服务层处理业务逻辑
        const users = yield teamService.getInvitableUsers(parseInt(teamId, 10), userId, query);
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(400).json({ message: error.message || '获取可邀请用户失败' });
    }
});
exports.getInvitableUsers = getInvitableUsers;
