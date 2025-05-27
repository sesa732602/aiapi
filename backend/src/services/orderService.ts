/**
 * 订单服务
 */
import { getRepository } from 'typeorm';
import { Order, OrderStatus } from '../models/Order';
import { ApiPlan } from '../models/ApiPlan';
import { Api } from '../models/Api';
import { UserQuota } from '../models/UserQuota';

/**
 * 创建订单
 */
export const createOrder = async (userId: number, apiId: number, planId: number): Promise<Order> => {
  // 验证API和套餐是否存在
  const apiRepository = getRepository(Api);
  const api = await apiRepository.findOne({ where: { id: apiId } });
  
  if (!api) {
    throw new Error('API不存在');
  }

  const planRepository = getRepository(ApiPlan);
  const plan = await planRepository.findOne({ where: { id: planId, apiId } });
  
  if (!plan) {
    throw new Error('套餐不存在');
  }

  // 创建订单
  const orderRepository = getRepository(Order);
  const order = new Order();
  order.userId = userId;
  order.apiId = apiId;
  order.planId = planId;
  order.amount = plan.price;
  order.status = OrderStatus.PENDING;
  order.callLimit = plan.callLimit;
  order.concurrencyLimit = plan.concurrencyLimit;
  order.validityDays = plan.validityDays;

  await orderRepository.save(order);
  return order;
};

/**
 * 获取订单列表
 */
export const getOrders = async (
  userId: number, 
  page: number = 1, 
  pageSize: number = 10, 
  status?: string
): Promise<{ orders: any[], total: number }> => {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // 构建查询条件
  const where: any = { userId };
  
  if (status) {
    where.status = status;
  }

  const orderRepository = getRepository(Order);
  
  // 查询订单总数
  const total = await orderRepository.count({ where });
  
  // 查询订单列表
  const orders = await orderRepository.find({
    where,
    skip,
    take,
    order: { createdAt: 'DESC' },
    relations: ['api', 'plan']
  });

  // 格式化返回数据
  const formattedOrders = orders.map(order => ({
    id: order.id,
    apiId: order.apiId,
    apiName: order.api?.name || '未知API',
    planId: order.planId,
    planName: order.plan?.name || '未知套餐',
    amount: order.amount,
    status: order.status,
    callLimit: order.callLimit,
    concurrencyLimit: order.concurrencyLimit,
    validityDays: order.validityDays,
    paidAt: order.paidAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  }));

  return { orders: formattedOrders, total };
};

/**
 * 获取订单详情
 */
export const getOrderById = async (id: number, userId: number): Promise<any> => {
  const orderRepository = getRepository(Order);
  const order = await orderRepository.findOne({
    where: { id, userId },
    relations: ['api', 'plan']
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  // 格式化返回数据
  return {
    id: order.id,
    apiId: order.apiId,
    apiName: order.api?.name || '未知API',
    planId: order.planId,
    planName: order.plan?.name || '未知套餐',
    amount: order.amount,
    status: order.status,
    callLimit: order.callLimit,
    concurrencyLimit: order.concurrencyLimit,
    validityDays: order.validityDays,
    paidAt: order.paidAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

/**
 * 支付订单
 */
export const payOrder = async (id: number, userId: number, transactionId?: string, paymentMethod?: string): Promise<Order> => {
  const orderRepository = getRepository(Order);
  const order = await orderRepository.findOne({
    where: { id, userId },
    relations: ['api', 'plan']
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('只有待支付的订单可以支付');
  }

  // 更新订单状态
  order.status = OrderStatus.PAID;
  order.paidAt = new Date();
  await orderRepository.save(order);

  // 更新用户额度
  await updateUserQuota(userId, order);

  return order;
};

/**
 * 取消订单
 */
export const cancelOrder = async (id: number, userId: number): Promise<Order> => {
  const orderRepository = getRepository(Order);
  const order = await orderRepository.findOne({
    where: { id, userId }
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('只有待支付的订单可以取消');
  }

  // 更新订单状态
  order.status = OrderStatus.CANCELLED;
  order.cancelledAt = new Date();
  await orderRepository.save(order);

  return order;
};

/**
 * 更新用户额度
 */
const updateUserQuota = async (userId: number, order: Order): Promise<void> => {
  const userQuotaRepository = getRepository(UserQuota);
  let userQuota = await userQuotaRepository.findOne({ where: { userId, apiId: order.apiId } });
  
  if (!userQuota) {
    userQuota = new UserQuota();
    userQuota.userId = userId;
    userQuota.apiId = order.apiId;
    userQuota.callLimit = 0;
    userQuota.concurrencyLimit = 0;
    userQuota.callsUsed = 0; // 修正: usedCalls → callsUsed
    userQuota.remainingCalls = 0; // 添加必要字段
    userQuota.totalCalls = 0; // 添加必要字段
    userQuota.expiresAt = new Date();
  }

  // 计算新的过期时间
  const now = new Date();
  const expiresAt = new Date(Math.max(
    userQuota.expiresAt?.getTime() || now.getTime(),
    now.getTime()
  ));
  expiresAt.setDate(expiresAt.getDate() + order.validityDays);

  // 更新用户额度
  userQuota.callLimit += order.callLimit;
  userQuota.concurrencyLimit = Math.max(userQuota.concurrencyLimit, order.concurrencyLimit);
  userQuota.expiresAt = expiresAt;
  
  await userQuotaRepository.save(userQuota);
};
