/**
 * 统计控制器
 */
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import type { Api } from '../models/Api';
import type { ApiCall } from '../models/ApiCall';
import type { Order } from '../models/Order';
import type { TeamMember } from '../models/TeamMember';
import type { UserQuota } from '../models/UserQuota';

/**
 * 获取API调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiCallStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { apiId, period = 'day', startDate, endDate } = req.query;
    
    // 构建查询条件
    const queryBuilder = getRepository(ApiCall)
      .createQueryBuilder('apiCall');
    
    // 如果指定了API ID，则只查询该API的调用记录
    if (apiId) {
      queryBuilder.where('apiCall.apiId = :apiId', { apiId });
      
      // 检查用户是否有权限查看该API的统计信息
      const api = await Api.findOne({ where: { id: apiId as string } });
      if (!api) {
        res.status(404).json({ message: 'API不存在' });
        return;
      }
      
      // 检查用户是否是API所有者或团队成员
      if (api.ownerId !== userId) {
        const teamMember = await TeamMember.findOne({
          where: {
            userId,
            teamId: api.teamId
          }
        });
        
        if (!teamMember && req.user?.role !== 'admin') {
          res.status(403).json({ message: '无权查看此API的统计信息' });
          return;
        }
      }
    } else {
      // 如果没有指定API ID，则查询用户有权限查看的所有API的调用记录
      const userApis = await Api.find({ where: { ownerId: userId } });
      const userApiIds = userApis.map(api => api.id);
      
      // 获取用户所在团队的API
      const teamMemberships = await TeamMember.find({ where: { userId } });
      const teamIds = teamMemberships.map(tm => tm.teamId);
      
      if (teamIds.length > 0) {
        const teamApis = await Api.find({ where: { teamId: { $in: teamIds } } });
        userApiIds.push(...teamApis.map(api => api.id));
      }
      
      if (userApiIds.length > 0) {
        queryBuilder.where('apiCall.apiId IN (:...apiIds)', { apiIds: userApiIds });
      } else {
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
    let timeFormat: string;
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
    
    const stats = await queryBuilder.getRawMany();
    
    // 获取API名称
    const apiIds = [...new Set(stats.map(stat => stat.apiId))];
    const apis = await Api.find({ where: { id: { $in: apiIds } } });
    const apiMap = apis.reduce((map, api) => {
      map[api.id] = api.name;
      return map;
    }, {} as Record<string, string>);
    
    // 格式化结果
    const formattedStats = stats.map(stat => ({
      time: stat.time,
      apiId: stat.apiId,
      apiName: apiMap[stat.apiId] || 'Unknown API',
      status: stat.status,
      count: parseInt(stat.count, 10)
    }));
    
    res.status(200).json({ stats: formattedStats });
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
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 检查用户是否为管理员
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: '无权查看收入统计' });
      return;
    }
    
    const { period = 'month', startDate, endDate } = req.query;
    
    // 构建查询条件
    const queryBuilder = getRepository(Order)
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
    let timeFormat: string;
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
    
    const stats = await queryBuilder.getRawMany();
    
    // 格式化结果
    const formattedStats = stats.map(stat => ({
      time: stat.time,
      revenue: parseFloat(stat.revenue),
      count: parseInt(stat.count, 10)
    }));
    
    res.status(200).json({ stats: formattedStats });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取用户增长统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getUserGrowthStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 检查用户是否为管理员
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: '无权查看用户增长统计' });
      return;
    }
    
    const { period = 'month', startDate, endDate } = req.query;
    
    // 构建查询条件
    const queryBuilder = getRepository('User')
      .createQueryBuilder('user');
    
    // 添加日期范围过滤
    if (startDate) {
      queryBuilder.where('user.createdAt >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { endDate });
    }
    
    // 根据时间周期分组
    let timeFormat: string;
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
    
    const stats = await queryBuilder.getRawMany();
    
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
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取API使用情况统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { apiId } = req.params;
    const { period = 'day', startDate, endDate } = req.query;
    
    // 检查API是否存在
    const api = await Api.findOne({ where: { id: apiId } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 检查用户是否有权限查看该API的统计信息
    if (api.ownerId !== userId) {
      const teamMember = await TeamMember.findOne({
        where: {
          userId,
          teamId: api.teamId
        }
      });
      
      if (!teamMember && req.user?.role !== 'admin') {
        res.status(403).json({ message: '无权查看此API的统计信息' });
        return;
      }
    }
    
    // 构建查询条件
    const queryBuilder = getRepository(ApiCall)
      .createQueryBuilder('apiCall')
      .where('apiCall.apiId = :apiId', { apiId });
    
    // 添加日期范围过滤
    if (startDate) {
      queryBuilder.andWhere('apiCall.createdAt >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('apiCall.createdAt <= :endDate', { endDate });
    }
    
    // 根据时间周期分组
    let timeFormat: string;
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
    
    const stats = await queryBuilder.getRawMany();
    
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
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取API性能统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiPerformanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { apiId } = req.params;
    
    // 检查API是否存在
    const api = await Api.findOne({ where: { id: apiId } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 检查用户是否有权限查看该API的统计信息
    if (api.ownerId !== userId) {
      const teamMember = await TeamMember.findOne({
        where: {
          userId,
          teamId: api.teamId
        }
      });
      
      if (!teamMember && req.user?.role !== 'admin') {
        res.status(403).json({ message: '无权查看此API的统计信息' });
        return;
      }
    }
    
    // 获取最近24小时的调用记录
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentCalls = await ApiCall.find({
      where: {
        apiId,
        createdAt: { $gte: oneDayAgo }
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
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 记录API调用
 * @param req 请求对象
 * @param res 响应对象
 */
export const recordApiCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, userId, status, responseTime, requestData, responseData } = req.body;
    
    // 验证必填字段
    if (!apiId || !status) {
      res.status(400).json({ message: '缺少必要参数' });
      return;
    }
    
    // 创建API调用记录
    const apiCall = new ApiCall();
    apiCall.apiId = apiId;
    apiCall.userId = userId || null;
    apiCall.status = status;
    apiCall.responseTime = responseTime || 0;
    apiCall.requestData = requestData || null;
    apiCall.responseData = responseData || null;
    
    await apiCall.save();
    
    res.status(201).json({
      message: 'API调用记录已保存',
      id: apiCall.id
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取用户调用统计
 * @param req 请求对象
 * @param res 响应对象
 */
export const getUserCallStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { period = 'day', startDate, endDate } = req.query;
    
    // 构建查询条件
    const queryBuilder = getRepository(ApiCall)
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
    let timeFormat: string;
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
    
    const stats = await queryBuilder.getRawMany();
    
    // 获取API名称
    const apiIds = [...new Set(stats.map(stat => stat.apiId))];
    const apis = await Api.find({ where: { id: { $in: apiIds } } });
    const apiMap = apis.reduce((map, api) => {
      map[api.id] = api.name;
      return map;
    }, {} as Record<string, string>);
    
    // 格式化结果
    const formattedStats = stats.map(stat => ({
      time: stat.time,
      apiId: stat.apiId,
      apiName: apiMap[stat.apiId] || 'Unknown API',
      status: stat.status,
      count: parseInt(stat.count, 10)
    }));
    
    res.status(200).json({ stats: formattedStats });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
export const getUserQuotas = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 获取用户所有API的额度
    const userQuotas = await UserQuota.find({
      where: { userId },
      relations: ['api']
    });
    
    // 格式化结果
    const formattedQuotas = userQuotas.map(quota => ({
      id: quota.id,
      apiId: quota.apiId,
      apiName: quota.api ? quota.api.name : 'Unknown API',
      remainingCalls: quota.remainingCalls,
      totalCalls: quota.totalCalls,
      expiresAt: quota.expiresAt
    }));
    
    res.status(200).json({ quotas: formattedQuotas });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 充值用户额度
 * @param req 请求对象
 * @param res 响应对象
 */
export const rechargeUserQuota = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 检查用户是否为管理员
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: '无权充值用户额度' });
      return;
    }
    
    const { userId, apiId, calls, expiresAt } = req.body;
    
    // 验证必填字段
    if (!userId || !apiId || !calls) {
      res.status(400).json({ message: '缺少必要参数' });
      return;
    }
    
    // 检查API是否存在
    const api = await Api.findOne({ where: { id: apiId } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 查找用户额度
    let userQuota = await UserQuota.findOne({
      where: { userId, apiId }
    });
    
    if (userQuota) {
      // 更新现有额度
      userQuota.remainingCalls += calls;
      userQuota.totalCalls += calls;
      if (expiresAt) {
        userQuota.expiresAt = new Date(expiresAt);
      }
    } else {
      // 创建新额度
      userQuota = new UserQuota();
      userQuota.userId = userId;
      userQuota.apiId = apiId;
      userQuota.remainingCalls = calls;
      userQuota.totalCalls = calls;
      userQuota.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    
    await userQuota.save();
    
    res.status(200).json({
      message: '用户额度充值成功',
      quota: {
        id: userQuota.id,
        userId: userQuota.userId,
        apiId: userQuota.apiId,
        remainingCalls: userQuota.remainingCalls,
        totalCalls: userQuota.totalCalls,
        expiresAt: userQuota.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
