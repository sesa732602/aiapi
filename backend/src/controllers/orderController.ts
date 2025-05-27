/**
 * 订单控制器 - 重构版本
 */
import { Request, Response } from 'express';
import * as orderService from '../services/orderService';

/**
 * 创建订单
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, planId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const order = await orderService.createOrder(userId, apiId, planId);

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: order
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    res.status(error instanceof Error && error.message.includes('不存在') ? 404 : 500)
      .json({ success: false, message });
  }
};

/**
 * 获取订单列表
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const { page = 1, pageSize = 10, status } = req.query;
    
    const { orders, total } = await orderService.getOrders(
      userId,
      Number(page),
      Number(pageSize),
      status as string | undefined
    );

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
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取订单详情
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const order = await orderService.getOrderById(Number(id), userId);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    res.status(error instanceof Error && error.message.includes('不存在') ? 404 : 500)
      .json({ success: false, message });
  }
};

/**
 * 支付订单
 */
export const payOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { transactionId, paymentMethod } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const order = await orderService.payOrder(Number(id), userId, transactionId, paymentMethod);

    res.status(200).json({
      success: true,
      message: '订单支付成功',
      data: {
        id: order.id,
        status: order.status,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    console.error('支付订单失败:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    const status = error instanceof Error 
      ? (error.message.includes('不存在') ? 404 : (error.message.includes('只有待支付') ? 400 : 500))
      : 500;
    res.status(status).json({ success: false, message });
  }
};

/**
 * 取消订单
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: '未授权' });
      return;
    }

    const order = await orderService.cancelOrder(Number(id), userId);

    res.status(200).json({
      success: true,
      message: '订单取消成功',
      data: {
        id: order.id,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    const status = error instanceof Error 
      ? (error.message.includes('不存在') ? 404 : (error.message.includes('只有待支付') ? 400 : 500))
      : 500;
    res.status(status).json({ success: false, message });
  }
};
