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
exports.cancelOrder = exports.payOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const orderService = __importStar(require("../services/orderService"));
/**
 * 创建订单
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { apiId, planId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: '未授权' });
            return;
        }
        const order = yield orderService.createOrder(userId, apiId, planId);
        res.status(201).json({
            success: true,
            message: '订单创建成功',
            data: order
        });
    }
    catch (error) {
        console.error('创建订单失败:', error);
        const message = error instanceof Error ? error.message : '服务器错误';
        res.status(error instanceof Error && error.message.includes('不存在') ? 404 : 500)
            .json({ success: false, message });
    }
});
exports.createOrder = createOrder;
/**
 * 获取订单列表
 */
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: '未授权' });
            return;
        }
        const { page = 1, pageSize = 10, status } = req.query;
        const { orders, total } = yield orderService.getOrders(userId, Number(page), Number(pageSize), status);
        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page: Number(page),
                    pageSize: Number(pageSize),
                    totalPages: Math.ceil(total / Number(pageSize))
                }
            }
        });
    }
    catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});
exports.getOrders = getOrders;
/**
 * 获取订单详情
 */
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: '未授权' });
            return;
        }
        const order = yield orderService.getOrderById(Number(id), userId);
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('获取订单详情失败:', error);
        const message = error instanceof Error ? error.message : '服务器错误';
        res.status(error instanceof Error && error.message.includes('不存在') ? 404 : 500)
            .json({ success: false, message });
    }
});
exports.getOrderById = getOrderById;
/**
 * 支付订单
 */
const payOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { transactionId, paymentMethod } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: '未授权' });
            return;
        }
        const order = yield orderService.payOrder(Number(id), userId, transactionId, paymentMethod);
        res.status(200).json({
            success: true,
            message: '订单支付成功',
            data: {
                id: order.id,
                status: order.status,
                paidAt: order.paidAt
            }
        });
    }
    catch (error) {
        console.error('支付订单失败:', error);
        const message = error instanceof Error ? error.message : '服务器错误';
        const status = error instanceof Error
            ? (error.message.includes('不存在') ? 404 : (error.message.includes('只有待支付') ? 400 : 500))
            : 500;
        res.status(status).json({ success: false, message });
    }
});
exports.payOrder = payOrder;
/**
 * 取消订单
 */
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: '未授权' });
            return;
        }
        const order = yield orderService.cancelOrder(Number(id), userId);
        res.status(200).json({
            success: true,
            message: '订单取消成功',
            data: {
                id: order.id,
                status: order.status,
                cancelledAt: order.cancelledAt
            }
        });
    }
    catch (error) {
        console.error('取消订单失败:', error);
        const message = error instanceof Error ? error.message : '服务器错误';
        const status = error instanceof Error
            ? (error.message.includes('不存在') ? 404 : (error.message.includes('只有待支付') ? 400 : 500))
            : 500;
        res.status(status).json({ success: false, message });
    }
});
exports.cancelOrder = cancelOrder;
