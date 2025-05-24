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
exports.getRevenueStats = exports.cancelOrder = exports.payOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const ApiPlan_1 = require("../models/ApiPlan");
const Api_1 = require("../models/Api");
const UserQuota_1 = require("../models/UserQuota");
/**
 * 创建订单
 * @param req 请求对象
 * @param res 响应对象
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planId } = req.body;
        const userId = req.user.id;
        // 检查套餐是否存在
        const planIdNum = parseInt(planId, 10);
        const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id: planIdNum } });
        if (!plan) {
            res.status(404).json({ message: 'API套餐不存在' });
            return;
        }
        // 获取API信息
        const api = yield Api_1.Api.findOne({ where: { id: plan.apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 创建订单
        const order = new Order_1.Order();
        order.userId = userId;
        order.apiId = api.id;
        order.planId = plan.id;
        order.amount = plan.price;
        order.status = 'pending';
        order.callLimit = plan.callLimit;
        order.concurrencyLimit = plan.concurrencyLimit;
        order.validityDays = plan.validityDays;
        yield order.save();
        res.status(201).json({
            message: '订单创建成功',
            order: {
                id: order.id,
                amount: order.amount,
                status: order.status,
                createdAt: order.createdAt,
                apiName: api.name,
                planName: plan.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.createOrder = createOrder;
/**
 * 获取订单列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        let orders = [];
        if (req.user.role === 'super_admin') {
            // 超级管理员可以查看所有订单
            if (status) {
                orders = yield Order_1.Order.find({ where: { status: status } });
            }
            else {
                orders = yield Order_1.Order.find();
            }
        }
        else {
            // 普通用户只能查看自己的订单
            if (status) {
                orders = yield Order_1.Order.find({ where: { userId, status: status } });
            }
            else {
                orders = yield Order_1.Order.find({ where: { userId } });
            }
        }
        // 获取订单详情
        const orderDetails = yield Promise.all(orders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield Api_1.Api.findOne({ where: { id: order.apiId } });
            const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id: order.planId } });
            return Object.assign(Object.assign({}, order), { apiName: api === null || api === void 0 ? void 0 : api.name, planName: plan === null || plan === void 0 ? void 0 : plan.name });
        })));
        res.status(200).json(orderDetails);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getOrders = getOrders;
/**
 * 获取订单详情
 * @param req 请求对象
 * @param res 响应对象
 */
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查订单是否存在
        const order = yield Order_1.Order.findOne({ where: { id } });
        if (!order) {
            res.status(404).json({ message: '订单不存在' });
            return;
        }
        // 检查用户是否有权限查看该订单
        if (req.user.role !== 'super_admin' && order.userId !== userId) {
            res.status(403).json({ message: '无权查看该订单' });
            return;
        }
        // 获取API和套餐信息
        const api = yield Api_1.Api.findOne({ where: { id: order.apiId } });
        const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id: order.planId } });
        res.status(200).json(Object.assign(Object.assign({}, order), { apiName: api === null || api === void 0 ? void 0 : api.name, planName: plan === null || plan === void 0 ? void 0 : plan.name }));
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getOrderById = getOrderById;
/**
 * 支付订单
 * @param req 请求对象
 * @param res 响应对象
 */
const payOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查订单是否存在
        const order = yield Order_1.Order.findOne({ where: { id } });
        if (!order) {
            res.status(404).json({ message: '订单不存在' });
            return;
        }
        // 检查用户是否有权限支付该订单
        if (req.user.role !== 'super_admin' && order.userId !== userId) {
            res.status(403).json({ message: '无权支付该订单' });
            return;
        }
        // 检查订单状态
        if (order.status !== 'pending') {
            res.status(400).json({ message: '订单状态不允许支付' });
            return;
        }
        // 更新订单状态
        order.status = 'paid';
        order.paidAt = new Date();
        yield order.save();
        // 更新用户额度
        let userQuota = yield UserQuota_1.UserQuota.findOne({ where: { userId, apiId: order.apiId } });
        if (!userQuota) {
            // 创建新的用户额度记录
            userQuota = new UserQuota_1.UserQuota();
            userQuota.userId = userId;
            userQuota.apiId = order.apiId;
            userQuota.callLimit = order.callLimit;
            userQuota.callsUsed = 0;
            userQuota.concurrencyLimit = order.concurrencyLimit;
            userQuota.expiresAt = new Date(Date.now() + order.validityDays * 24 * 60 * 60 * 1000);
        }
        else {
            // 更新现有额度
            userQuota.callLimit += order.callLimit;
            userQuota.concurrencyLimit = Math.max(userQuota.concurrencyLimit, order.concurrencyLimit);
            // 更新过期时间，取较晚的时间
            const newExpiresAt = new Date(Date.now() + order.validityDays * 24 * 60 * 60 * 1000);
            if (!userQuota.expiresAt || userQuota.expiresAt < newExpiresAt) {
                userQuota.expiresAt = newExpiresAt;
            }
        }
        yield userQuota.save();
        res.status(200).json({
            message: '订单支付成功',
            order: Object.assign(Object.assign({}, order), { paidAt: order.paidAt }),
            quota: userQuota
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.payOrder = payOrder;
/**
 * 取消订单
 * @param req 请求对象
 * @param res 响应对象
 */
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查订单是否存在
        const order = yield Order_1.Order.findOne({ where: { id } });
        if (!order) {
            res.status(404).json({ message: '订单不存在' });
            return;
        }
        // 检查用户是否有权限取消该订单
        if (req.user.role !== 'super_admin' && order.userId !== userId) {
            res.status(403).json({ message: '无权取消该订单' });
            return;
        }
        // 检查订单状态
        if (order.status !== 'pending') {
            res.status(400).json({ message: '订单状态不允许取消' });
            return;
        }
        // 更新订单状态
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        yield order.save();
        res.status(200).json({
            message: '订单取消成功',
            order: Object.assign(Object.assign({}, order), { cancelledAt: order.cancelledAt })
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.cancelOrder = cancelOrder;
/**
 * 获取收入统计
 * @param req 请求对象
 * @param res 响应对象
 */
const getRevenueStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, apiId } = req.query;
        let whereClause = { status: 'paid' };
        if (startDate && endDate) {
            whereClause.paidAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (apiId) {
            whereClause.apiId = parseInt(apiId, 10);
        }
        // 获取已支付订单
        const orders = yield Order_1.Order.find({ where: whereClause });
        // 计算总收入
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount), 0);
        // 按API分组统计
        const apiRevenue = {};
        for (const order of orders) {
            const apiIdStr = order.apiId.toString();
            if (!apiRevenue[apiIdStr]) {
                apiRevenue[apiIdStr] = 0;
            }
            apiRevenue[apiIdStr] += Number(order.amount);
        }
        // 获取API名称
        const apiRevenueDetails = yield Promise.all(Object.entries(apiRevenue).map((_a) => __awaiter(void 0, [_a], void 0, function* ([apiIdStr, revenue]) {
            const apiId = parseInt(apiIdStr, 10);
            const api = yield Api_1.Api.findOne({ where: { id: apiId } });
            return {
                apiId,
                apiName: (api === null || api === void 0 ? void 0 : api.name) || 'Unknown API',
                revenue
            };
        })));
        res.status(200).json({
            totalRevenue,
            apiRevenue: apiRevenueDetails,
            orderCount: orders.length
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
});
exports.getRevenueStats = getRevenueStats;
