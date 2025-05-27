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
 * API路由配置
 */
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const teamController = __importStar(require("../controllers/teamController"));
const apiController = __importStar(require("../controllers/apiController"));
const apiPlanController = __importStar(require("../controllers/apiPlanController"));
const orderController = __importStar(require("../controllers/orderController"));
const statsController = __importStar(require("../controllers/statsController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const authValidators_1 = require("../validators/authValidators");
const router = (0, express_1.Router)();
// 健康检查
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// 认证相关路由
router.post('/auth/register', (0, validationMiddleware_1.validate)(authValidators_1.registerValidation), authController.register);
router.post('/auth/login', (0, validationMiddleware_1.validate)(authValidators_1.loginValidation), authController.login);
router.post('/auth/google', (0, validationMiddleware_1.validate)(authValidators_1.googleLoginValidation), authController.googleLogin);
router.post('/auth/wechat', (0, validationMiddleware_1.validate)(authValidators_1.wechatLoginValidation), authController.wechatLogin);
router.post('/auth/logout', authMiddleware_1.authMiddleware, authController.logout);
router.get('/auth/me', authMiddleware_1.authMiddleware, authController.getCurrentUser);
router.put('/auth/profile', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(authValidators_1.updateProfileValidation), authController.updateProfile);
router.post('/auth/change-password', authMiddleware_1.authMiddleware, (0, validationMiddleware_1.validate)(authValidators_1.changePasswordValidation), authController.changePassword);
// 团队相关路由
router.get('/team', authMiddleware_1.authMiddleware, teamController.getUserTeam);
router.post('/team', authMiddleware_1.authMiddleware, teamController.createTeam);
router.get('/team/details', authMiddleware_1.authMiddleware, teamController.getTeamDetails);
router.put('/team', authMiddleware_1.authMiddleware, teamController.updateTeam);
router.delete('/team', authMiddleware_1.authMiddleware, teamController.deleteTeam);
router.get('/team/members', authMiddleware_1.authMiddleware, teamController.getTeamMembers);
router.post('/team/members', authMiddleware_1.authMiddleware, teamController.addTeamMember);
router.put('/team/members/:memberId', authMiddleware_1.authMiddleware, teamController.updateTeamMemberRole);
router.delete('/team/members/:memberId', authMiddleware_1.authMiddleware, teamController.removeTeamMember);
router.post('/team/leave', authMiddleware_1.authMiddleware, teamController.leaveTeam);
router.get('/team/invitable-users', authMiddleware_1.authMiddleware, teamController.getInvitableUsers);
// API相关路由
router.post('/apis', authMiddleware_1.authMiddleware, apiController.createApi);
router.get('/apis', authMiddleware_1.authMiddleware, apiController.getApis);
router.get('/apis/:id', authMiddleware_1.authMiddleware, apiController.getApiById);
router.put('/apis/:id', authMiddleware_1.authMiddleware, apiController.updateApi);
router.delete('/apis/:id', authMiddleware_1.authMiddleware, apiController.deleteApi);
// API版本相关路由
router.post('/apis/:id/versions', authMiddleware_1.authMiddleware, apiController.createApiVersion);
router.get('/apis/:id/versions', authMiddleware_1.authMiddleware, apiController.getApiVersions);
router.put('/apis/:id/versions/:versionId/current', authMiddleware_1.authMiddleware, apiController.setCurrentApiVersion);
// API权限相关路由
router.post('/apis/:id/permissions', authMiddleware_1.authMiddleware, apiController.addApiPermission);
router.get('/apis/:id/permissions', authMiddleware_1.authMiddleware, apiController.getApiPermissions);
router.delete('/apis/:id/permissions/:permissionId', authMiddleware_1.authMiddleware, apiController.deleteApiPermission);
// API套餐相关路由
router.post('/apis/:id/plans', authMiddleware_1.authMiddleware, apiPlanController.createApiPlan);
router.get('/apis/:id/plans', authMiddleware_1.authMiddleware, apiPlanController.getApiPlans);
router.put('/apis/:id/plans/:planId', authMiddleware_1.authMiddleware, apiPlanController.updateApiPlan);
router.delete('/apis/:id/plans/:planId', authMiddleware_1.authMiddleware, apiPlanController.deleteApiPlan);
// 订单相关路由
router.post('/orders', authMiddleware_1.authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware_1.authMiddleware, orderController.getOrders);
router.get('/orders/:id', authMiddleware_1.authMiddleware, orderController.getOrderById);
router.put('/orders/:id/pay', authMiddleware_1.authMiddleware, orderController.payOrder);
router.put('/orders/:id/cancel', authMiddleware_1.authMiddleware, orderController.cancelOrder);
// 统计相关路由
router.post('/stats/calls', authMiddleware_1.authMiddleware, statsController.recordApiCall);
router.get('/stats/apis/:apiId/calls', authMiddleware_1.authMiddleware, statsController.getApiCallStats);
router.get('/stats/users/calls', authMiddleware_1.authMiddleware, statsController.getUserCallStats);
router.get('/stats/revenue', authMiddleware_1.authMiddleware, statsController.getRevenueStats);
// 用户额度相关路由
router.get('/users/quotas', authMiddleware_1.authMiddleware, statsController.getUserQuota);
router.post('/users/quotas/recharge', authMiddleware_1.authMiddleware, statsController.updateUserQuota);
exports.default = router;
