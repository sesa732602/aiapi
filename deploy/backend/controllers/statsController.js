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
exports.rechargeUserQuota = exports.getUserQuotas = exports.getUserCallStats = exports.getApiCallStats = exports.recordApiCall = void 0;
const ApiCall_1 = require("../models/ApiCall");
const Api_1 = require("../models/Api");
const UserQuota_1 = require("../models/UserQuota");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
/**
 * 记录API调用
 * @param req 请求对象
 * @param res 响应对象
 */
const recordApiCall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { apiId, responseTime, statusCode, requestSize, responseSize } = req.body;
        const userId = req.user.id;
        // 检查API是否存在
        const apiIdNum = parseInt(apiId, 10);
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户额度
        const userQuota = yield UserQuota_1.UserQuota.findOne({ where: { userId, apiId: apiIdNum } });
        if (!userQuota) {
            res.status(403).json({ message: '用户没有该API的调用权限' });
            return;
        }
        // 检查调用次数限制
        if (userQuota.callsUsed >= userQuota.callLimit) {
            res.status(403).json({ message: '已达到API调用次数上限' });
            return;
        }
        // 检查并发限制
        const oneMinuteAgo = new Date(Date.now() - 60000); // 最近1分钟
        const currentConcurrency = yield ApiCall_1.ApiCall.count({
            where: {
                userId,
                apiId: apiIdNum,
                startTime: (0, typeorm_1.MoreThan)(oneMinuteAgo)
            }
        });
        if (currentConcurrency >= userQuota.concurrencyLimit) {
            res.status(429).json({ message: '已达到API并发调用上限' });
            return;
        }
        // 检查额度是否过期
        if (userQuota.expiresAt && userQuota.expiresAt < new Date()) {
            res.status(403).json({ message: 'API调用权限已过期' });
            return;
        }
        // 记录API调用
        const apiCall = new ApiCall_1.ApiCall();
        apiCall.userId = userId;
        apiCall.apiId = apiIdNum;
        apiCall.startTime = new Date();
        apiCall.responseTime = responseTime;
        apiCall.statusCode = statusCode;
        apiCall.requestSize = requestSize;
        apiCall.responseSize = responseSize;
        yield apiCall.save();
        // 更新用户额度
        userQuota.callsUsed += 1;
        yield userQuota.save();
        res.status(201).json({
            message: 'API调用记录成功',
            remainingCalls: userQuota.callLimit - userQuota.callsUsed
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.recordApiCall = recordApiCall;
/**
 * 获取API调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiCallStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiId = parseInt(req.params.apiId, 10);
        const { startDate, endDate } = req.query;
        const userId = req.user.id;
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限查看该API的调用统计
        if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
            res.status(403).json({ message: '无权查看该API的调用统计' });
            return;
        }
        let whereClause = { apiId };
        if (startDate && endDate) {
            whereClause.startTime = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
        }
        // 获取API调用记录
        const apiCalls = yield ApiCall_1.ApiCall.find({ where: whereClause });
        // 计算统计数据
        const totalCalls = apiCalls.length;
        const successCalls = apiCalls.filter(call => call.statusCode >= 200 && call.statusCode < 300).length;
        const errorCalls = totalCalls - successCalls;
        const avgResponseTime = apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / totalCalls || 0;
        // 按用户分组统计
        const userCallsMap = {};
        for (const call of apiCalls) {
            const userIdStr = call.userId.toString();
            if (!userCallsMap[userIdStr]) {
                userCallsMap[userIdStr] = 0;
            }
            userCallsMap[userIdStr] += 1;
        }
        // 获取用户名称
        const userCalls = yield Promise.all(Object.entries(userCallsMap).map((_a) => __awaiter(void 0, [_a], void 0, function* ([userIdStr, calls]) {
            const userId = parseInt(userIdStr, 10);
            const user = yield User_1.User.findOne({ where: { id: userId } });
            return {
                userId,
                username: (user === null || user === void 0 ? void 0 : user.username) || 'Unknown User',
                calls
            };
        })));
        // 按天统计
        const dailyStats = {};
        for (const call of apiCalls) {
            const dateStr = call.startTime.toISOString().split('T')[0];
            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = 0;
            }
            dailyStats[dateStr] += 1;
        }
        res.status(200).json({
            totalCalls,
            successCalls,
            errorCalls,
            successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
            avgResponseTime,
            userCalls,
            dailyStats: Object.entries(dailyStats).map(([date, calls]) => ({ date, calls }))
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getApiCallStats = getApiCallStats;
/**
 * 获取用户调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserCallStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        let whereClause = { userId };
        if (startDate && endDate) {
            whereClause.startTime = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
        }
        // 获取用户API调用记录
        const apiCalls = yield ApiCall_1.ApiCall.find({ where: whereClause });
        // 计算统计数据
        const totalCalls = apiCalls.length;
        const successCalls = apiCalls.filter(call => call.statusCode >= 200 && call.statusCode < 300).length;
        const errorCalls = totalCalls - successCalls;
        const avgResponseTime = apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / totalCalls || 0;
        // 按API分组统计
        const apiCallsMap = {};
        for (const call of apiCalls) {
            const apiIdStr = call.apiId.toString();
            if (!apiCallsMap[apiIdStr]) {
                apiCallsMap[apiIdStr] = 0;
            }
            apiCallsMap[apiIdStr] += 1;
        }
        // 获取API名称
        const apiCallStats = yield Promise.all(Object.entries(apiCallsMap).map((_a) => __awaiter(void 0, [_a], void 0, function* ([apiIdStr, calls]) {
            const apiId = parseInt(apiIdStr, 10);
            const api = yield Api_1.Api.findOne({ where: { id: apiId } });
            return {
                apiId,
                apiName: (api === null || api === void 0 ? void 0 : api.name) || 'Unknown API',
                calls
            };
        })));
        // 按天统计
        const dailyStats = {};
        for (const call of apiCalls) {
            const dateStr = call.startTime.toISOString().split('T')[0];
            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = 0;
            }
            dailyStats[dateStr] += 1;
        }
        res.status(200).json({
            totalCalls,
            successCalls,
            errorCalls,
            successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
            avgResponseTime,
            apiCallStats,
            dailyStats: Object.entries(dailyStats).map(([date, calls]) => ({ date, calls }))
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getUserCallStats = getUserCallStats;
/**
 * 获取用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
const getUserQuotas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // 获取用户额度
        const quotas = yield UserQuota_1.UserQuota.find({ where: { userId } });
        // 获取API名称
        const quotaDetails = yield Promise.all(quotas.map((quota) => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield Api_1.Api.findOne({ where: { id: quota.apiId } });
            return Object.assign(Object.assign({}, quota), { apiName: (api === null || api === void 0 ? void 0 : api.name) || 'Unknown API', remainingCalls: quota.callLimit - quota.callsUsed, isExpired: quota.expiresAt ? quota.expiresAt < new Date() : false });
        })));
        res.status(200).json(quotaDetails);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getUserQuotas = getUserQuotas;
/**
 * 充值用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
const rechargeUserQuota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, apiId, callLimit, concurrencyLimit, validityDays } = req.body;
        // 检查用户是否存在
        const userIdNum = parseInt(userId, 10);
        const user = yield User_1.User.findOne({ where: { id: userIdNum } });
        if (!user) {
            res.status(404).json({ message: '用户不存在' });
            return;
        }
        // 检查API是否存在
        const apiIdNum = parseInt(apiId, 10);
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 获取用户额度
        let userQuota = yield UserQuota_1.UserQuota.findOne({ where: { userId: userIdNum, apiId: apiIdNum } });
        if (!userQuota) {
            // 创建新的用户额度记录
            userQuota = new UserQuota_1.UserQuota();
            userQuota.userId = userIdNum;
            userQuota.apiId = apiIdNum;
            userQuota.callLimit = callLimit;
            userQuota.callsUsed = 0;
            userQuota.concurrencyLimit = concurrencyLimit;
            userQuota.expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
        }
        else {
            // 更新现有额度
            userQuota.callLimit += callLimit;
            userQuota.concurrencyLimit = Math.max(userQuota.concurrencyLimit, concurrencyLimit);
            // 更新过期时间，取较晚的时间
            const newExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
            if (!userQuota.expiresAt || userQuota.expiresAt < newExpiresAt) {
                userQuota.expiresAt = newExpiresAt;
            }
        }
        yield userQuota.save();
        res.status(200).json({
            message: '用户额度充值成功',
            quota: Object.assign(Object.assign({}, userQuota), { apiName: api.name, remainingCalls: userQuota.callLimit - userQuota.callsUsed })
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.rechargeUserQuota = rechargeUserQuota;
