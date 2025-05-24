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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 路由配置
 */
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authController = __importStar(require("../controllers/authController"));
const teamController = __importStar(require("../controllers/teamController"));
const apiController = __importStar(require("../controllers/apiController"));
const apiPlanController = __importStar(require("../controllers/apiPlanController"));
const orderController = __importStar(require("../controllers/orderController"));
const statsController = __importStar(require("../controllers/statsController"));
const asyncWrapper_1 = require("../utils/asyncWrapper");
const router = (0, express_1.Router)();
// 认证路由
router.post('/auth/register', (0, asyncWrapper_1.asyncWrapper)(authController.register));
router.post('/auth/login', (0, asyncWrapper_1.asyncWrapper)(authController.login));
router.post('/auth/google', (0, asyncWrapper_1.asyncWrapper)(authController.googleLogin));
router.post('/auth/wechat', (0, asyncWrapper_1.asyncWrapper)(authController.wechatLogin));
router.get('/auth/me', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(authController.getMe));
// 团队路由
router.post('/teams', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.createTeam));
router.get('/teams', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.getTeams));
router.get('/teams/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.getTeamById));
router.put('/teams/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.updateTeam));
router.delete('/teams/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.deleteTeam));
router.post('/teams/:id/members', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.addTeamMember));
router.put('/teams/:id/members/:memberId', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.updateTeamMemberRole));
router.delete('/teams/:id/members/:memberId', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(teamController.removeTeamMember));
// API路由
router.post('/apis', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.createApi));
router.get('/apis', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.getApis));
router.get('/apis/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.getApiById));
router.put('/apis/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.updateApi));
router.delete('/apis/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.deleteApi));
router.post('/apis/:id/versions', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.createApiVersion));
router.get('/apis/:id/versions', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.getApiVersions));
router.put('/apis/:id/versions/:versionId/current', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.setCurrentApiVersion));
router.post('/apis/:id/permissions', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.addApiPermission));
router.get('/apis/:id/permissions', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.getApiPermissions));
router.delete('/apis/:id/permissions/:permissionId', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiController.removeApiPermission));
// API套餐路由
router.post('/api-plans', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiPlanController.createApiPlan));
router.get('/apis/:apiId/plans', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiPlanController.getApiPlans));
router.get('/api-plans/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiPlanController.getApiPlanById));
router.put('/api-plans/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiPlanController.updateApiPlan));
router.delete('/api-plans/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(apiPlanController.deleteApiPlan));
// 订单路由
router.post('/orders', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.createOrder));
router.get('/orders', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.getOrders));
router.get('/orders/:id', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.getOrderById));
router.post('/orders/:id/pay', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.payOrder));
router.post('/orders/:id/cancel', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.cancelOrder));
router.get('/revenue-stats', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(orderController.getRevenueStats));
// 统计路由
router.post('/api-calls', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(statsController.recordApiCall));
router.get('/apis/:apiId/stats', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(statsController.getApiCallStats));
router.get('/user/stats', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(statsController.getUserCallStats));
router.get('/user/quotas', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(statsController.getUserQuotas));
router.post('/user/quotas/recharge', authMiddleware_1.authenticateJWT, (0, asyncWrapper_1.asyncWrapper)(statsController.rechargeUserQuota));
exports.default = router;
