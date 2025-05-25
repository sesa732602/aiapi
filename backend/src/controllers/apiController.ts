/**
 * API管理控制器
 */
import { Request, Response } from 'express';
import * as apiService from '../services/apiService';

/**
 * 创建API
 * @param req 请求对象
 * @param res 响应对象
 */
export const createApi = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { name, description, path, method, teamId } = req.body;
    const userId = req.user.id;
    
    // 调用服务层处理业务逻辑
    const api = await apiService.createApi(userId, { name, description, path, method, teamId });
    
    res.status(201).json({
      message: 'API创建成功',
      api
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API创建失败' });
  }
};

/**
 * 获取API列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApis = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const { teamId } = req.query;
    
    // 调用服务层处理业务逻辑
    const apis = await apiService.getApis(
      userId,
      teamId ? parseInt(teamId as string, 10) : undefined
    );
    
    res.status(200).json({ apis });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '获取API列表失败' });
  }
};

/**
 * 获取API详情
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    
    // 调用服务层处理业务逻辑
    const api = await apiService.getApiById(apiId, userId);
    
    res.status(200).json({ api });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'API不存在' });
  }
};

/**
 * 更新API
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateApi = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    const { name, description, path, method } = req.body;
    
    // 调用服务层处理业务逻辑
    const api = await apiService.updateApi(apiId, userId, { name, description, path, method });
    
    res.status(200).json({
      message: 'API更新成功',
      api
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API更新失败' });
  }
};

/**
 * 删除API
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteApi = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    
    // 调用服务层处理业务逻辑
    await apiService.deleteApi(apiId, userId);
    
    res.status(200).json({ message: 'API删除成功' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API删除失败' });
  }
};

/**
 * 创建API版本
 * @param req 请求对象
 * @param res 响应对象
 */
export const createApiVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    const { version, description, spec } = req.body;
    
    // 调用服务层处理业务逻辑
    const apiVersion = await apiService.createApiVersion(apiId, userId, { version, description, spec });
    
    res.status(201).json({
      message: 'API版本创建成功',
      apiVersion
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API版本创建失败' });
  }
};

/**
 * 获取API版本列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    
    // 调用服务层处理业务逻辑
    const versions = await apiService.getApiVersions(apiId, userId);
    
    res.status(200).json({ versions });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '获取API版本列表失败' });
  }
};

/**
 * 设置当前API版本
 * @param req 请求对象
 * @param res 响应对象
 */
export const setCurrentApiVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    const versionId = parseInt(req.params.versionId, 10);
    
    // 调用服务层处理业务逻辑
    const result = await apiService.setCurrentApiVersion(apiId, versionId, userId);
    
    res.status(200).json({
      message: '当前版本设置成功',
      api: result
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '设置当前版本失败' });
  }
};

/**
 * 添加API权限
 * @param req 请求对象
 * @param res 响应对象
 */
export const addApiPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    const { type, targetId } = req.body;
    
    // 调用服务层处理业务逻辑
    const permission = await apiService.addApiPermission(apiId, userId, { type, targetId });
    
    res.status(201).json({
      message: 'API权限添加成功',
      permission
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API权限添加失败' });
  }
};

/**
 * 获取API权限列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getApiPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    
    // 调用服务层处理业务逻辑
    const permissions = await apiService.getApiPermissions(apiId, userId);
    
    res.status(200).json({ permissions });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '获取API权限列表失败' });
  }
};

/**
 * 删除API权限
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteApiPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const userId = req.user.id;
    const apiId = parseInt(req.params.id, 10);
    const permissionId = parseInt(req.params.permissionId, 10);
    
    // 调用服务层处理业务逻辑
    await apiService.deleteApiPermission(apiId, permissionId, userId);
    
    res.status(200).json({ message: 'API权限删除成功' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'API权限删除失败' });
  }
};
