/**
 * API套餐控制器
 */
import { Request, Response } from 'express';
import { ApiPlan } from '../models/ApiPlan';
import { Api } from '../models/Api';
import { TeamMember } from '../models/TeamMember';
import { ApiPermission, ApiPermissionType } from '../models/ApiPermission';

/**
 * 创建API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
export const createApiPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, name, description, price, callLimit, concurrencyLimit, validityDays } = req.body;
    const userId = req.user.id;
    
    // 检查API是否存在
    const apiIdNum = parseInt(apiId, 10);
    const api = await Api.findOne({ where: { id: apiIdNum } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 检查用户是否有权限创建套餐
    if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
      // 检查用户是否是API所属团队的管理员
      if (api.teamId) {
        const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
        if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
          // 检查用户是否有API管理权限
          const apiPermission = await ApiPermission.findOne({ 
            where: { apiId: apiIdNum, userId, permissionType: ApiPermissionType.ADMIN } 
          });
          if (!apiPermission) {
            res.status(403).json({ message: '无权创建API套餐' });
            return;
          }
        }
      } else {
        // 检查用户是否有API管理权限
        const apiPermission = await ApiPermission.findOne({ 
          where: { apiId: apiIdNum, userId, permissionType: ApiPermissionType.ADMIN } 
        });
        if (!apiPermission) {
          res.status(403).json({ message: '无权创建API套餐' });
          return;
        }
      }
    }
    
    // 创建新套餐
    const apiPlan = new ApiPlan();
    apiPlan.apiId = apiIdNum;
    apiPlan.name = name;
    apiPlan.description = description;
    apiPlan.price = price;
    apiPlan.callLimit = callLimit;
    apiPlan.concurrencyLimit = concurrencyLimit;
    apiPlan.validityDays = validityDays;
    await apiPlan.save();
    
    res.status(201).json({
      message: 'API套餐创建成功',
      plan: apiPlan
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取API套餐列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiId = parseInt(req.params.apiId, 10);
    
    // 检查API是否存在
    const api = await Api.findOne({ where: { id: apiId } });
    if (!api) {
      res.status(404).json({ message: 'API不存在' });
      return;
    }
    
    // 获取API套餐
    const plans = await ApiPlan.find({ where: { apiId } });
    
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取API套餐详情
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // 检查套餐是否存在
    const plan = await ApiPlan.findOne({ where: { id } });
    if (!plan) {
      res.status(404).json({ message: 'API套餐不存在' });
      return;
    }
    
    // 获取API信息
    const api = await Api.findOne({ where: { id: plan.apiId } });
    
    res.status(200).json({
      ...plan,
      apiName: api?.name
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 更新API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateApiPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, callLimit, concurrencyLimit, validityDays } = req.body;
    const userId = req.user.id;
    
    // 检查套餐是否存在
    const plan = await ApiPlan.findOne({ where: { id } });
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
    
    // 检查用户是否有权限更新套餐
    if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
      // 检查用户是否是API所属团队的管理员
      if (api.teamId) {
        const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
        if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
          // 检查用户是否有API管理权限
          const apiPermission = await ApiPermission.findOne({ 
            where: { apiId: plan.apiId, userId, permissionType: ApiPermissionType.ADMIN } 
          });
          if (!apiPermission) {
            res.status(403).json({ message: '无权更新API套餐' });
            return;
          }
        }
      } else {
        // 检查用户是否有API管理权限
        const apiPermission = await ApiPermission.findOne({ 
          where: { apiId: plan.apiId, userId, permissionType: ApiPermissionType.ADMIN } 
        });
        if (!apiPermission) {
          res.status(403).json({ message: '无权更新API套餐' });
          return;
        }
      }
    }
    
    // 更新套餐信息
    if (name) {
      plan.name = name;
    }
    
    if (description) {
      plan.description = description;
    }
    
    if (price) {
      plan.price = price;
    }
    
    if (callLimit) {
      plan.callLimit = callLimit;
    }
    
    if (concurrencyLimit) {
      plan.concurrencyLimit = concurrencyLimit;
    }
    
    if (validityDays) {
      plan.validityDays = validityDays;
    }
    
    await plan.save();
    
    res.status(200).json({
      message: 'API套餐更新成功',
      plan
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 删除API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteApiPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    
    // 检查套餐是否存在
    const plan = await ApiPlan.findOne({ where: { id } });
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
    
    // 检查用户是否有权限删除套餐
    if (req.user.role !== 'super_admin' && api.createdBy !== userId) {
      // 检查用户是否是API所属团队的管理员
      if (api.teamId) {
        const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
        if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
          // 检查用户是否有API管理权限
          const apiPermission = await ApiPermission.findOne({ 
            where: { apiId: plan.apiId, userId, permissionType: ApiPermissionType.ADMIN } 
          });
          if (!apiPermission) {
            res.status(403).json({ message: '无权删除API套餐' });
            return;
          }
        }
      } else {
        // 检查用户是否有API管理权限
        const apiPermission = await ApiPermission.findOne({ 
          where: { apiId: plan.apiId, userId, permissionType: ApiPermissionType.ADMIN } 
        });
        if (!apiPermission) {
          res.status(403).json({ message: '无权删除API套餐' });
          return;
        }
      }
    }
    
    // 删除套餐
    await ApiPlan.delete({ id });
    
    res.status(200).json({ message: 'API套餐删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
