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
exports.removeTeamMember = exports.updateTeamMemberRole = exports.addTeamMember = exports.deleteTeam = exports.updateTeam = exports.getTeamById = exports.getTeams = exports.createTeam = void 0;
const Team_1 = require("../models/Team");
const TeamMember_1 = require("../models/TeamMember");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
/**
 * 创建团队
 * @param req 请求对象
 * @param res 响应对象
 */
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;
        // 检查团队名称是否已存在
        const existingTeam = yield Team_1.Team.findOne({ where: { name } });
        if (existingTeam) {
            res.status(400).json({ message: '团队名称已存在' });
            return;
        }
        // 创建新团队
        const team = new Team_1.Team();
        team.name = name;
        team.description = description;
        team.createdBy = userId;
        yield team.save();
        // 将创建者添加为团队拥有者
        const teamMember = new TeamMember_1.TeamMember();
        teamMember.teamId = team.id;
        teamMember.userId = userId;
        teamMember.role = 'owner';
        yield teamMember.save();
        res.status(201).json({
            message: '团队创建成功',
            team: {
                id: team.id,
                name: team.name,
                description: team.description,
                createdAt: team.createdAt
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.createTeam = createTeam;
/**
 * 获取团队列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        let teams = [];
        if (req.user.role === 'super_admin') {
            // 超级管理员可以查看所有团队
            teams = yield Team_1.Team.find();
        }
        else {
            // 普通用户只能查看自己所在的团队
            const teamMembers = yield TeamMember_1.TeamMember.find({ where: { userId } });
            const teamIds = teamMembers.map(member => member.teamId);
            if (teamIds.length > 0) {
                teams = yield Team_1.Team.find({ where: { id: (0, typeorm_1.In)(teamIds) } });
            }
        }
        // 获取团队成员数量
        const teamsWithMemberCount = yield Promise.all(teams.map((team) => __awaiter(void 0, void 0, void 0, function* () {
            const memberCount = yield TeamMember_1.TeamMember.count({ where: { teamId: team.id } });
            return Object.assign(Object.assign({}, team), { memberCount });
        })));
        res.status(200).json(teamsWithMemberCount);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getTeams = getTeams;
/**
 * 获取团队详情
 * @param req 请求对象
 * @param res 响应对象
 */
const getTeamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查用户是否有权限查看该团队
        if (req.user.role !== 'super_admin') {
            const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
            if (!teamMember) {
                res.status(403).json({ message: '无权查看该团队' });
                return;
            }
        }
        // 获取团队成员
        const members = yield TeamMember_1.TeamMember.find({ where: { teamId: id } });
        // 获取成员用户信息
        const memberDetails = yield Promise.all(members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { id: member.userId } });
            return Object.assign(Object.assign({}, member), { username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email });
        })));
        res.status(200).json(Object.assign(Object.assign({}, team), { members: memberDetails }));
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getTeamById = getTeamById;
/**
 * 更新团队信息
 * @param req 请求对象
 * @param res 响应对象
 */
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description } = req.body;
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查用户是否有权限更新该团队
        if (req.user.role !== 'super_admin') {
            const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
            if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                res.status(403).json({ message: '无权更新该团队' });
                return;
            }
        }
        // 检查团队名称是否已被其他团队使用
        if (name && name !== team.name) {
            const existingTeam = yield Team_1.Team.findOne({ where: { name } });
            if (existingTeam) {
                res.status(400).json({ message: '团队名称已存在' });
                return;
            }
            team.name = name;
        }
        if (description) {
            team.description = description;
        }
        yield team.save();
        res.status(200).json({
            message: '团队更新成功',
            team
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.updateTeam = updateTeam;
/**
 * 删除团队
 * @param req 请求对象
 * @param res 响应对象
 */
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查用户是否有权限删除该团队
        if (req.user.role !== 'super_admin' && team.createdBy !== userId) {
            const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
            if (!teamMember || teamMember.role !== 'owner') {
                res.status(403).json({ message: '无权删除该团队' });
                return;
            }
        }
        // 删除团队成员
        yield TeamMember_1.TeamMember.delete({ teamId: id });
        // 删除团队
        yield Team_1.Team.delete({ id });
        res.status(200).json({ message: '团队删除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.deleteTeam = deleteTeam;
/**
 * 添加团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
const addTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const { userId: memberUserId, role } = req.body;
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查用户是否有权限添加成员
        if (req.user.role !== 'super_admin') {
            const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
            if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                res.status(403).json({ message: '无权添加团队成员' });
                return;
            }
        }
        // 检查角色是否有效
        if (!['owner', 'admin', 'member'].includes(role)) {
            res.status(400).json({ message: '无效的角色' });
            return;
        }
        // 检查用户是否存在
        const memberUserIdNum = parseInt(memberUserId, 10);
        const user = yield User_1.User.findOne({ where: { id: memberUserIdNum } });
        if (!user) {
            res.status(404).json({ message: '用户不存在' });
            return;
        }
        // 检查用户是否已是团队成员
        const existingMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId: memberUserIdNum } });
        if (existingMember) {
            res.status(400).json({ message: '用户已是团队成员' });
            return;
        }
        // 添加团队成员
        const teamMember = new TeamMember_1.TeamMember();
        teamMember.teamId = id;
        teamMember.userId = memberUserIdNum;
        teamMember.role = role;
        yield teamMember.save();
        res.status(201).json({
            message: '团队成员添加成功',
            member: Object.assign(Object.assign({}, teamMember), { username: user.username, email: user.email })
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.addTeamMember = addTeamMember;
/**
 * 更新团队成员角色
 * @param req 请求对象
 * @param res 响应对象
 */
const updateTeamMemberRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const memberId = parseInt(req.params.memberId, 10);
        const { role } = req.body;
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查团队成员是否存在
        const member = yield TeamMember_1.TeamMember.findOne({ where: { id: memberId, teamId: id } });
        if (!member) {
            res.status(404).json({ message: '团队成员不存在' });
            return;
        }
        // 检查用户是否有权限更新成员角色
        if (req.user.role !== 'super_admin') {
            const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
            if (!teamMember || teamMember.role !== 'owner') {
                res.status(403).json({ message: '无权更新团队成员角色' });
                return;
            }
        }
        // 检查角色是否有效
        if (!['owner', 'admin', 'member'].includes(role)) {
            res.status(400).json({ message: '无效的角色' });
            return;
        }
        // 更新成员角色
        member.role = role;
        yield member.save();
        // 获取成员用户信息
        const user = yield User_1.User.findOne({ where: { id: member.userId } });
        res.status(200).json({
            message: '团队成员角色更新成功',
            member: Object.assign(Object.assign({}, member), { username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email })
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.updateTeamMemberRole = updateTeamMemberRole;
/**
 * 移除团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const memberId = parseInt(req.params.memberId, 10);
        const userId = req.user.id;
        // 检查团队是否存在
        const team = yield Team_1.Team.findOne({ where: { id } });
        if (!team) {
            res.status(404).json({ message: '团队不存在' });
            return;
        }
        // 检查团队成员是否存在
        const member = yield TeamMember_1.TeamMember.findOne({ where: { id: memberId, teamId: id } });
        if (!member) {
            res.status(404).json({ message: '团队成员不存在' });
            return;
        }
        // 检查用户是否有权限移除成员
        if (req.user.role !== 'super_admin') {
            // 用户可以移除自己
            if (member.userId !== userId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: id, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    res.status(403).json({ message: '无权移除团队成员' });
                    return;
                }
                // 管理员不能移除拥有者
                if (teamMember.role === 'admin' && member.role === 'owner') {
                    res.status(403).json({ message: '无权移除团队拥有者' });
                    return;
                }
            }
        }
        // 移除团队成员
        yield TeamMember_1.TeamMember.delete({ id: memberId });
        res.status(200).json({ message: '团队成员移除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.removeTeamMember = removeTeamMember;
