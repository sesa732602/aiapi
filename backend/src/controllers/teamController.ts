/**
 * 团队控制器
 */
import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

/**
 * 创建团队
 * @param req 请求对象
 * @param res 响应对象
 */
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const team = await teamService.createTeam(name, description, userId);
    
    res.status(201).json({
      message: '团队创建成功',
      team
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '团队创建失败' });
  }
};

/**
 * 获取用户所在的团队
 * @param req 请求对象
 * @param res 响应对象
 */
export const getUserTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const teams = await teamService.getUserTeams(userId);
    
    res.status(200).json({ teams });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '获取团队失败' });
  }
};

/**
 * 获取团队详情
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTeamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId } = req.query;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const team = await teamService.getTeamDetails(parseInt(teamId as string, 10), userId);
    
    res.status(200).json({ team });
  } catch (error: any) {
    res.status(404).json({ message: error.message || '获取团队详情失败' });
  }
};

/**
 * 更新团队信息
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId, name, description } = req.body;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const team = await teamService.updateTeam(parseInt(teamId, 10), userId, { name, description });
    
    res.status(200).json({
      message: '团队更新成功',
      team
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '团队更新失败' });
  }
};

/**
 * 删除团队
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId } = req.body;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    await teamService.deleteTeam(parseInt(teamId, 10), userId);
    
    res.status(200).json({ message: '团队删除成功' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '团队删除失败' });
  }
};

/**
 * 获取团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId } = req.query;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const members = await teamService.getTeamMembers(parseInt(teamId as string, 10), userId);
    
    res.status(200).json({ members });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '获取团队成员失败' });
  }
};

/**
 * 添加团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId, email, role } = req.body;
    
    if (!teamId || !email) {
      res.status(400).json({ message: '缺少必要参数' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const member = await teamService.addTeamMember(
      parseInt(teamId, 10),
      userId,
      email,
      role || 'member'
    );
    
    res.status(201).json({
      message: '成员添加成功',
      member
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '添加团队成员失败' });
  }
};

/**
 * 更新团队成员角色
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTeamMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId, role } = req.body;
    const memberId = parseInt(req.params.memberId, 10);
    
    if (!teamId || !role) {
      res.status(400).json({ message: '缺少必要参数' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const member = await teamService.updateTeamMemberRole(
      parseInt(teamId, 10),
      userId,
      memberId,
      role
    );
    
    res.status(200).json({
      message: '成员角色更新成功',
      member
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '更新成员角色失败' });
  }
};

/**
 * 移除团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId } = req.body;
    const memberId = parseInt(req.params.memberId, 10);
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    await teamService.removeTeamMember(parseInt(teamId, 10), userId, memberId);
    
    res.status(200).json({ message: '成员移除成功' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '移除成员失败' });
  }
};

/**
 * 离开团队
 * @param req 请求对象
 * @param res 响应对象
 */
export const leaveTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId } = req.body;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    await teamService.leaveTeam(parseInt(teamId, 10), userId);
    
    res.status(200).json({ message: '已成功离开团队' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '离开团队失败' });
  }
};

/**
 * 获取可邀请的用户
 * @param req 请求对象
 * @param res 响应对象
 */
export const getInvitableUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { teamId, query } = req.query;
    
    if (!teamId) {
      res.status(400).json({ message: '缺少团队ID' });
      return;
    }
    
    // 调用服务层处理业务逻辑
    const users = await teamService.getInvitableUsers(
      parseInt(teamId as string, 10),
      userId,
      query as string
    );
    
    res.status(200).json({ users });
  } catch (error: any) {
    res.status(400).json({ message: error.message || '获取可邀请用户失败' });
  }
};
