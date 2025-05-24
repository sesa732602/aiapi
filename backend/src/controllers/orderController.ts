/**
 * 订单控制器
 */
import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { ApiPlan } from '../models/ApiPlan';
import { Api } from '../models/Api';
import { UserQuota } from '../models/UserQuota';
import { User } from '../models/User';

/**
 * 创建订单
 * @param req 请求对象
 * @param res 响应对象
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    // 检查套餐是否存在
    const planIdNum = parseInt(planId, 10);
    const plan = await ApiPlan.findOne({ where: { id: planIdNum } });
    if (!plan) {
      res.status(404).json({ message: 'API套餐不存在' });
      return;
    }
    
    // 获取API信息
    const api = await Api.findOne({ where: { id: plan.apiId } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 创建订单
    const order = new Order();
    order.userId = userId;
    order.apiId = api.id;
    order.planId = plan.id;
    order.amount = plan.price;
    order.status = 'pending';
    order.callLimit = plan.callLimit;
    order.concurrencyLimit = plan.concurrencyLimit;
    order.validityDays = plan.validityDays;
    await order.save();
    
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
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取订单列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    let orders: Order[] = [];
    
    if (req.user.role === 'super_admin') {
      // 超级管理员可以查看所有订单
      if (status) {
        orders = await Order.find({ where: { status: status as string } });
      } else {
        orders = await Order.find();
      }
    } else {
      // 普通用户只能查看自己的订单
      if (status) {
        orders = await Order.find({ where: { userId, status: status as string } });
      } else {
        orders = await Order.find({ where: { userId } });
      }
    }
    
    // 获取订单详情
    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const api = await Api.findOne({ where: { id: order.apiId } });
        const plan = await ApiPlan.findOne({ where: { id: order.planId } });
        return {
          ...order,
          apiName: api?.name,
          planName: plan?.name
        };
      })
    );
    
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取订单详情
 * @param req 请求对象
 * @param res 响应对象
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    
    // 检查订单是否存在
    const order = await Order.findOne({ where: { id } });
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
    const api = await Api.findOne({ where: { id: order.apiId } });
    const plan = await ApiPlan.findOne({ where: { id: order.planId } });
    
    res.status(200).json({
      ...order,
      apiName: api?.name,
      planName: plan?.name
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 支付订单
 * @param req 请求对象
 * @param res 响应对象
 */
export const payOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    
    // 检查订单是否存在
    const order = await Order.findOne({ where: { id } });
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
    await order.save();
    
    // 更新用户额度
    let userQuota = await UserQuota.findOne({ where: { userId, apiId: order.apiId } });
    
    if (!userQuota) {
      // 创建新的用户额度记录
      userQuota = new UserQuota();
      userQuota.userId = userId;
      userQuota.apiId = order.apiId;
      userQuota.callLimit = order.callLimit;
      userQuota.callsUsed = 0;
      userQuota.concurrencyLimit = order.concurrencyLimit;
      userQuota.expiresAt = new Date(Date.now() + order.validityDays * 24 * 60 * 60 * 1000);
    } else {
      // 更新现有额度
      userQuota.callLimit += order.callLimit;
      userQuota.concurrencyLimit = Math.max(userQuota.concurrencyLimit, order.concurrencyLimit);
      
      // 更新过期时间，取较晚的时间
      const newExpiresAt = new Date(Date.now() + order.validityDays * 24 * 60 * 60 * 1000);
      if (!userQuota.expiresAt || userQuota.expiresAt < newExpiresAt) {
        userQuota.expiresAt = newExpiresAt;
      }
    }
    
    await userQuota.save();
    
    res.status(200).json({
      message: '订单支付成功',
      order: {
        ...order,
        paidAt: order.paidAt
      },
      quota: userQuota
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 取消订单
 * @param req 请求对象
 * @param res 响应对象
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    
    // 检查订单是否存在
    const order = await Order.findOne({ where: { id } });
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
    await order.save();
    
    res.status(200).json({
      message: '订单取消成功',
      order: {
        ...order,
        cancelledAt: order.cancelledAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取收入统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getRevenueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, apiId } = req.query;
    
    let whereClause: any = { status: 'paid' };
    
    if (startDate && endDate) {
      whereClause.paidAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (apiId) {
      whereClause.apiId = parseInt(apiId as string, 10);
    }
    
    // 获取已支付订单
    const orders = await Order.find({ where: whereClause });
    
    // 计算总收入
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    
    // 按API分组统计
    const apiRevenue: Record<string, number> = {};
    for (const order of orders) {
      const apiIdStr = order.apiId.toString();
      if (!apiRevenue[apiIdStr]) {
        apiRevenue[apiIdStr] = 0;
      }
      apiRevenue[apiIdStr] += Number(order.amount);
    }
    
    // 获取API名称
    const apiRevenueDetails = await Promise.all(
      Object.entries(apiRevenue).map(async ([apiIdStr, revenue]) => {
        const apiId = parseInt(apiIdStr, 10);
        const api = await Api.findOne({ where: { id: apiId } });
        return {
          apiId,
          apiName: api?.name || 'Unknown API',
          revenue
        };
      })
    );
    
    res.status(200).json({
      totalRevenue,
      apiRevenue: apiRevenueDetails,
      orderCount: orders.length
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
