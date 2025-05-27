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
exports.updateUserQuota = exports.getUserQuota = exports.getUserCallStats = exports.recordApiCall = exports.getApiPerformanceStats = exports.getApiUsageStats = exports.getUserGrowthStats = exports.getRevenueStats = exports.getApiCallStats = void 0;
const typeorm_1 = require("typeorm");
const Api_1 = require("../models/Api");
const ApiCall_1 = require("../models/ApiCall");
const Order_1 = require("../models/Order");
const TeamMember_1 = require("../models/TeamMember");
const UserQuota_1 = require("../models/UserQuota");
/**
 * 获取API调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiCallStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { apiId, period = 'day', startDate, endDate } = req.query;
        // 构建查询条件
        const queryBuilder = (0, typeorm_1.getRepository)(ApiCall_1.ApiCall)
            .createQueryBuilder('apiCall');
        // 如果指定了API ID，则只查询该API的调用记录
        if (apiId) {
            const apiIdNum = parseInt(apiId, 10);
            queryBuilder.where('apiCall.apiId = :apiId', { apiId: apiIdNum });
            // 检查用户是否有权限查看该API的统计信息
            const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
            if (!api) {
                res.status(404).json({ message: 'API不存在' });
                return;
            }
            // 检查用户是否是API所有者或团队成员
            if (api.ownerId !== userId) {
                // 如果teamId为null，则不需要查询团队成员
                if (api.teamId !== null) {
                    const teamMember = yield TeamMember_1.TeamMember.findOne({
                        where: {
                            userId,
                            teamId: api.teamId
                        }
                    });
                    if (!teamMember && req.user.role !== 'admin') {
                        res.status(403).json({ message: '无权查看此API的统计信息' });
                        return;
                    }
                }
                else if (req.user.role !== 'admin') {
                    res.status(403).json({ message: '无权查看此API的统计信息' });
                    return;
                }
            }
        }
        else {
            // 如果没有指定API ID，则查询用户有权限查看的所有API的调用记录
            const userApis = yield Api_1.Api.find({ where: { ownerId: userId } });
            const userApiIds = userApis.map(api => api.id);
            // 获取用户所在团队的API
            const teamMemberships = yield TeamMember_1.TeamMember.find({ where: { userId } });
            const teamIds = teamMemberships.map(tm => tm.teamId).filter(id => id !== null);
            if (teamIds.length > 0) {
                const teamApis = yield Api_1.Api.find({ where: { teamId: (0, typeorm_1.In)(teamIds) } });
                userApiIds.push(...teamApis.map(api => api.id));
            }
            if (userApiIds.length > 0) {
                queryBuilder.where('apiCall.apiId IN (:...apiIds)', { apiIds: userApiIds });
            }
            else {
                // 用户没有任何API
                res.status(200).json({ stats: [] });
                return;
            }
        }
        // 添加日期范围过滤
        if (startDate) {
            queryBuilder.andWhere('apiCall.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('apiCall.createdAt <= :endDate', { endDate });
        }
        // 根据时间周期分组
        let timeFormat;
        switch (period) {
            case 'hour':
                timeFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                timeFormat = '%Y-%m-%d';
                break;
            case 'week':
                timeFormat = '%Y-%u'; // ISO week number
                break;
            case 'month':
                timeFormat = '%Y-%m';
                break;
            case 'year':
                timeFormat = '%Y';
                break;
            default:
                timeFormat = '%Y-%m-%d';
        }
        queryBuilder
            .select(`DATE_FORMAT(apiCall.createdAt, '${timeFormat}')`, 'time')
            .addSelect('COUNT(*)', 'count')
            .addSelect('apiCall.apiId', 'apiId')
            .addSelect('apiCall.status', 'status')
            .groupBy('time, apiId, status')
            .orderBy('time', 'ASC');
        const stats = yield queryBuilder.getRawMany();
        // 获取API名称
        const apiIds = [...new Set(stats.map(stat => stat.apiId))];
        const apis = yield Api_1.Api.find({ where: { id: (0, typeorm_1.In)(apiIds) } });
        const apiMap = apis.reduce((map, api) => {
            map[api.id] = api.name;
            return map;
        }, {});
        // 格式化结果
        const formattedStats = stats.map(stat => ({
            time: stat.time,
            apiId: stat.apiId,
            apiName: apiMap[stat.apiId] || 'Unknown API',
            status: stat.status,
            count: parseInt(stat.count, 10)
        }));
        res.status(200).json({ stats: formattedStats });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getApiCallStats = getApiCallStats;
/**
 * 获取收入统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getRevenueStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        // 检查用户是否为管理员
        if (req.user.role !== 'admin') {
            res.status(403).json({ message: '无权查看收入统计' });
            return;
        }
        const { period = 'month', startDate, endDate } = req.query;
        // 构建查询条件
        const queryBuilder = (0, typeorm_1.getRepository)(Order_1.Order)
            .createQueryBuilder('order')
            .where('order.status = :status', { status: 'completed' });
        // 添加日期范围过滤
        if (startDate) {
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
        }
        // 根据时间周期分组
        let timeFormat;
        switch (period) {
            case 'day':
                timeFormat = '%Y-%m-%d';
                break;
            case 'week':
                timeFormat = '%Y-%u'; // ISO week number
                break;
            case 'month':
                timeFormat = '%Y-%m';
                break;
            case 'year':
                timeFormat = '%Y';
                break;
            default:
                timeFormat = '%Y-%m';
        }
        queryBuilder
            .select(`DATE_FORMAT(order.createdAt, '${timeFormat}')`, 'time')
            .addSelect('SUM(order.amount)', 'revenue')
            .addSelect('COUNT(*)', 'count')
            .groupBy('time')
            .orderBy('time', 'ASC');
        const stats = yield queryBuilder.getRawMany();
        // 格式化结果
        const formattedStats = stats.map(stat => ({
            time: stat.time,
            revenue: parseFloat(stat.revenue),
            count: parseInt(stat.count, 10)
        }));
        res.status(200).json({ stats: formattedStats });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getRevenueStats = getRevenueStats;
/**
 * 获取用户增长统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserGrowthStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        // 检查用户是否为管理员
        if (req.user.role !== 'admin') {
            res.status(403).json({ message: '无权查看用户增长统计' });
            return;
        }
        const { period = 'month', startDate, endDate } = req.query;
        // 构建查询条件
        const queryBuilder = (0, typeorm_1.getRepository)('User')
            .createQueryBuilder('user');
        // 添加日期范围过滤
        if (startDate) {
            queryBuilder.where('user.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('user.createdAt <= :endDate', { endDate });
        }
        // 根据时间周期分组
        let timeFormat;
        switch (period) {
            case 'day':
                timeFormat = '%Y-%m-%d';
                break;
            case 'week':
                timeFormat = '%Y-%u'; // ISO week number
                break;
            case 'month':
                timeFormat = '%Y-%m';
                break;
            case 'year':
                timeFormat = '%Y';
                break;
            default:
                timeFormat = '%Y-%m';
        }
        queryBuilder
            .select(`DATE_FORMAT(user.createdAt, '${timeFormat}')`, 'time')
            .addSelect('COUNT(*)', 'count')
            .groupBy('time')
            .orderBy('time', 'ASC');
        const stats = yield queryBuilder.getRawMany();
        // 计算累计用户数
        let cumulativeCount = 0;
        const formattedStats = stats.map(stat => {
            cumulativeCount += parseInt(stat.count, 10);
            return {
                time: stat.time,
                newUsers: parseInt(stat.count, 10),
                totalUsers: cumulativeCount
            };
        });
        res.status(200).json({ stats: formattedStats });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getUserGrowthStats = getUserGrowthStats;
/**
 * 获取API使用情况统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiUsageStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { apiId } = req.params;
        const apiIdNum = parseInt(apiId, 10);
        const { period = 'day', startDate, endDate } = req.query;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限查看该API的统计信息
        if (api.ownerId !== userId) {
            // 如果teamId为null，则不需要查询团队成员
            if (api.teamId !== null) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({
                    where: {
                        userId,
                        teamId: api.teamId
                    }
                });
                if (!teamMember && req.user.role !== 'admin') {
                    res.status(403).json({ message: '无权查看此API的统计信息' });
                    return;
                }
            }
            else if (req.user.role !== 'admin') {
                res.status(403).json({ message: '无权查看此API的统计信息' });
                return;
            }
        }
        // 构建查询条件
        const queryBuilder = (0, typeorm_1.getRepository)(ApiCall_1.ApiCall)
            .createQueryBuilder('apiCall')
            .where('apiCall.apiId = :apiId', { apiId: apiIdNum });
        // 添加日期范围过滤
        if (startDate) {
            queryBuilder.andWhere('apiCall.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('apiCall.createdAt <= :endDate', { endDate });
        }
        // 根据时间周期分组
        let timeFormat;
        switch (period) {
            case 'hour':
                timeFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                timeFormat = '%Y-%m-%d';
                break;
            case 'week':
                timeFormat = '%Y-%u'; // ISO week number
                break;
            case 'month':
                timeFormat = '%Y-%m';
                break;
            case 'year':
                timeFormat = '%Y';
                break;
            default:
                timeFormat = '%Y-%m-%d';
        }
        queryBuilder
            .select(`DATE_FORMAT(apiCall.createdAt, '${timeFormat}')`, 'time')
            .addSelect('COUNT(*)', 'count')
            .addSelect('apiCall.status', 'status')
            .addSelect('AVG(apiCall.responseTime)', 'avgResponseTime')
            .addSelect('MAX(apiCall.responseTime)', 'maxResponseTime')
            .addSelect('MIN(apiCall.responseTime)', 'minResponseTime')
            .groupBy('time, status')
            .orderBy('time', 'ASC');
        const stats = yield queryBuilder.getRawMany();
        // 格式化结果
        const formattedStats = stats.map(stat => ({
            time: stat.time,
            status: stat.status,
            count: parseInt(stat.count, 10),
            avgResponseTime: parseFloat(stat.avgResponseTime),
            maxResponseTime: parseFloat(stat.maxResponseTime),
            minResponseTime: parseFloat(stat.minResponseTime)
        }));
        res.status(200).json({
            apiId,
            apiName: api.name,
            stats: formattedStats
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getApiUsageStats = getApiUsageStats;
/**
 * 获取API性能统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiPerformanceStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { apiId } = req.params;
        const apiIdNum = parseInt(apiId, 10);
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限查看该API的统计信息
        if (api.ownerId !== userId) {
            // 如果teamId为null，则不需要查询团队成员
            if (api.teamId !== null) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({
                    where: {
                        userId,
                        teamId: api.teamId
                    }
                });
                if (!teamMember && req.user.role !== 'admin') {
                    res.status(403).json({ message: '无权查看此API的统计信息' });
                    return;
                }
            }
            else if (req.user.role !== 'admin') {
                res.status(403).json({ message: '无权查看此API的统计信息' });
                return;
            }
        }
        // 获取最近24小时的调用记录
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentCalls = yield ApiCall_1.ApiCall.find({
            where: {
                apiId: apiIdNum,
                createdAt: (0, typeorm_1.MoreThanOrEqual)(oneDayAgo)
            },
            order: { createdAt: 'DESC' }
        });
        // 计算性能指标
        const totalCalls = recentCalls.length;
        const successCalls = recentCalls.filter(call => call.status === 200).length;
        const errorCalls = totalCalls - successCalls;
        const successRate = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;
        // 计算响应时间统计
        let totalResponseTime = 0;
        let maxResponseTime = 0;
        let minResponseTime = recentCalls.length > 0 ? recentCalls[0].responseTime : 0;
        recentCalls.forEach(call => {
            totalResponseTime += call.responseTime;
            maxResponseTime = Math.max(maxResponseTime, call.responseTime);
            minResponseTime = Math.min(minResponseTime, call.responseTime);
        });
        const avgResponseTime = totalCalls > 0 ? totalResponseTime / totalCalls : 0;
        // 计算每小时调用量
        const hourlyStats = Array(24).fill(0);
        const now = new Date();
        recentCalls.forEach(call => {
            const callTime = new Date(call.createdAt);
            const hoursAgo = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60 * 60));
            if (hoursAgo >= 0 && hoursAgo < 24) {
                hourlyStats[hoursAgo]++;
            }
        });
        // 反转数组，使索引0表示24小时前，索引23表示当前小时
        hourlyStats.reverse();
        res.status(200).json({
            apiId,
            apiName: api.name,
            totalCalls,
            successCalls,
            errorCalls,
            successRate,
            avgResponseTime,
            maxResponseTime,
            minResponseTime,
            hourlyStats
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getApiPerformanceStats = getApiPerformanceStats;
/**
 * 记录API调用
 * @param req 请求对象
 * @param res 响应对象
 */
const recordApiCall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { apiId, userId, status, responseTime, requestData, responseData } = req.body;
        // 验证必填字段
        if (!apiId || !status) {
            res.status(400).json({ message: '缺少必要参数' });
            return;
        }
        // 创建API调用记录
        const apiCall = new ApiCall_1.ApiCall();
        apiCall.apiId = parseInt(apiId, 10);
        apiCall.userId = userId ? parseInt(userId, 10) : null;
        apiCall.status = status;
        apiCall.responseTime = responseTime || 0;
        apiCall.requestData = requestData || null;
        apiCall.responseData = responseData || null;
        apiCall.startTime = new Date();
        yield apiCall.save();
        res.status(201).json({
            message: 'API调用记录已保存',
            id: apiCall.id
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.recordApiCall = recordApiCall;
/**
 * 获取用户调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserCallStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { period = 'day', startDate, endDate } = req.query;
        // 构建查询条件
        const queryBuilder = (0, typeorm_1.getRepository)(ApiCall_1.ApiCall)
            .createQueryBuilder('apiCall')
            .where('apiCall.userId = :userId', { userId });
        // 添加日期范围过滤
        if (startDate) {
            queryBuilder.andWhere('apiCall.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('apiCall.createdAt <= :endDate', { endDate });
        }
        // 根据时间周期分组
        let timeFormat;
        switch (period) {
            case 'hour':
                timeFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                timeFormat = '%Y-%m-%d';
                break;
            case 'week':
                timeFormat = '%Y-%u'; // ISO week number
                break;
            case 'month':
                timeFormat = '%Y-%m';
                break;
            case 'year':
                timeFormat = '%Y';
                break;
            default:
                timeFormat = '%Y-%m-%d';
        }
        queryBuilder
            .select(`DATE_FORMAT(apiCall.createdAt, '${timeFormat}')`, 'time')
            .addSelect('COUNT(*)', 'count')
            .addSelect('apiCall.apiId', 'apiId')
            .addSelect('apiCall.status', 'status')
            .groupBy('time, apiId, status')
            .orderBy('time', 'ASC');
        const stats = yield queryBuilder.getRawMany();
        // 获取API名称
        const apiIds = [...new Set(stats.map(stat => stat.apiId))];
        const apis = yield Api_1.Api.find({ where: { id: (0, typeorm_1.In)(apiIds) } });
        const apiMap = apis.reduce((map, api) => {
            map[api.id] = api.name;
            return map;
        }, {});
        // 格式化结果
        const formattedStats = stats.map(stat => ({
            time: stat.time,
            apiId: stat.apiId,
            apiName: apiMap[stat.apiId] || 'Unknown API',
            status: stat.status,
            count: parseInt(stat.count, 10)
        }));
        res.status(200).json({ stats: formattedStats });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getUserCallStats = getUserCallStats;
/**
 * 获取用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserQuota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const userId = req.user.id;
        const { apiId } = req.params;
        const apiIdNum = parseInt(apiId, 10);
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 获取用户额度
        const quota = yield UserQuota_1.UserQuota.findOne({
            where: {
                userId,
                apiId: apiIdNum
            }
        });
        if (!quota) {
            res.status(404).json({ message: '未找到额度信息' });
            return;
        }
        // 计算剩余调用次数
        const remainingCalls = quota.callLimit - quota.callsUsed;
        res.status(200).json({
            apiId,
            apiName: api.name,
            callLimit: quota.callLimit,
            callsUsed: quota.callsUsed,
            remainingCalls,
            totalCalls: quota.callLimit,
            concurrencyLimit: quota.concurrencyLimit,
            expiresAt: quota.expiresAt
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getUserQuota = getUserQuota;
/**
 * 更新用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
const updateUserQuota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        // 检查用户是否为管理员
        if (req.user.role !== 'admin') {
            res.status(403).json({ message: '无权更新用户额度' });
            return;
        }
        const { userId, apiId, calls, expiresAt } = req.body;
        if (!userId || !apiId || calls === undefined) {
            res.status(400).json({ message: '缺少必要参数' });
            return;
        }
        const userIdNum = parseInt(userId, 10);
        const apiIdNum = parseInt(apiId, 10);
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 查找或创建用户额度
        let userQuota = yield UserQuota_1.UserQuota.findOne({
            where: {
                userId: userIdNum,
                apiId: apiIdNum
            }
        });
        if (userQuota) {
            // 更新现有额度
            userQuota.callsUsed = 0;
            userQuota.callLimit = calls;
            userQuota.remainingCalls = calls;
            userQuota.totalCalls = calls;
            userQuota.expiresAt = expiresAt ? new Date(expiresAt) : userQuota.expiresAt;
        }
        else {
            // 创建新额度
            userQuota = new UserQuota_1.UserQuota();
            userQuota.userId = userIdNum;
            userQuota.apiId = apiIdNum;
            userQuota.callLimit = calls;
            userQuota.callsUsed = 0;
            userQuota.remainingCalls = calls;
            userQuota.totalCalls = calls;
            userQuota.concurrencyLimit = 5; // 默认并发限制
            userQuota.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }
        yield userQuota.save();
        res.status(200).json({
            message: '用户额度已更新',
            quota: {
                userId: userQuota.userId,
                apiId: userQuota.apiId,
                callLimit: userQuota.callLimit,
                callsUsed: userQuota.callsUsed,
                remainingCalls: userQuota.remainingCalls,
                totalCalls: userQuota.totalCalls,
                concurrencyLimit: userQuota.concurrencyLimit,
                expiresAt: userQuota.expiresAt
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.updateUserQuota = updateUserQuota;
