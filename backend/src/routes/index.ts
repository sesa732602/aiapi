/**
 * API路由配置
 */
import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';
import * as teamController from '../controllers/teamController';
import * as apiController from '../controllers/apiController';
import * as apiPlanController from '../controllers/apiPlanController';
import * as orderController from '../controllers/orderController';
import * as statsController from '../controllers/statsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { 
  registerValidation, 
  loginValidation, 
  googleLoginValidation, 
  wechatLoginValidation,
  changePasswordValidation,
  updateProfileValidation
} from '../validators/authValidators';

const router = Router();

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 认证相关路由
router.post('/auth/register', validate(registerValidation), authController.register);
router.post('/auth/login', validate(loginValidation), authController.login);
router.post('/auth/google', validate(googleLoginValidation), authController.googleLogin);
router.post('/auth/wechat', validate(wechatLoginValidation), authController.wechatLogin);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);
router.put('/auth/profile', authMiddleware, validate(updateProfileValidation), authController.updateProfile);
router.post('/auth/change-password', authMiddleware, validate(changePasswordValidation), authController.changePassword);

// 团队相关路由
router.get('/team', authMiddleware, teamController.getUserTeam);
router.post('/team', authMiddleware, teamController.createTeam);
router.get('/team/details', authMiddleware, teamController.getTeamDetails);
router.put('/team', authMiddleware, teamController.updateTeam);
router.delete('/team', authMiddleware, teamController.deleteTeam);
router.get('/team/members', authMiddleware, teamController.getTeamMembers);
router.post('/team/members', authMiddleware, teamController.addTeamMember);
router.put('/team/members/:memberId', authMiddleware, teamController.updateTeamMemberRole);
router.delete('/team/members/:memberId', authMiddleware, teamController.removeTeamMember);
router.post('/team/leave', authMiddleware, teamController.leaveTeam);
router.get('/team/invitable-users', authMiddleware, teamController.getInvitableUsers);

// API相关路由
router.post('/apis', authMiddleware, apiController.createApi);
router.get('/apis', authMiddleware, apiController.getApis);
router.get('/apis/:id', authMiddleware, apiController.getApiById);
router.put('/apis/:id', authMiddleware, apiController.updateApi);
router.delete('/apis/:id', authMiddleware, apiController.deleteApi);

// API版本相关路由
router.post('/apis/:id/versions', authMiddleware, apiController.createApiVersion);
router.get('/apis/:id/versions', authMiddleware, apiController.getApiVersions);
router.put('/apis/:id/versions/:versionId/current', authMiddleware, apiController.setCurrentApiVersion);

// API权限相关路由
router.post('/apis/:id/permissions', authMiddleware, apiController.addApiPermission);
router.get('/apis/:id/permissions', authMiddleware, apiController.getApiPermissions);
router.delete('/apis/:id/permissions/:permissionId', authMiddleware, apiController.deleteApiPermission);

// API套餐相关路由
router.post('/apis/:id/plans', authMiddleware, apiPlanController.createApiPlan);
router.get('/apis/:id/plans', authMiddleware, apiPlanController.getApiPlans);
router.put('/apis/:id/plans/:planId', authMiddleware, apiPlanController.updateApiPlan);
router.delete('/apis/:id/plans/:planId', authMiddleware, apiPlanController.deleteApiPlan);

// 订单相关路由
router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.put('/orders/:id/pay', authMiddleware, orderController.payOrder);
router.put('/orders/:id/cancel', authMiddleware, orderController.cancelOrder);

// 统计相关路由
router.post('/stats/calls', authMiddleware, statsController.recordApiCall);
router.get('/stats/apis/:apiId/calls', authMiddleware, statsController.getApiCallStats);
router.get('/stats/users/calls', authMiddleware, statsController.getUserCallStats);
router.get('/stats/revenue', authMiddleware, statsController.getRevenueStats);

// 用户额度相关路由
router.get('/users/quotas', authMiddleware, statsController.getUserQuota);
router.post('/users/quotas/recharge', authMiddleware, statsController.updateUserQuota);

export default router;
