/**
 * 团队管理API接口
 */
import { Request, Response } from 'express';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';
import { In, Not } from 'typeorm';

/**
 * 获取用户的团队
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(200).json({ hasTeam: false });
      return;
    }
    
    // 获取团队详情
    const team = await Team.findOne({ where: { id: teamMember.teamId } });
    
    if (!team) {
      res.status(404).json({ message: '团队不存在' });
      return;
    }
    
    // 获取团队成员数量
    const memberCount = await TeamMember.count({ where: { teamId: team.id } });
    
    res.status(200).json({
      hasTeam: true,
      team: {
        ...team,
        memberCount,
        userRole: teamMember.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

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
    
    // 检查用户是否已经拥有或加入团队
    const existingMembership = await TeamMember.findOne({ where: { userId: userId } });
    if (existingMembership) {
      res.status(400).json({ message: '您已经拥有或加入了一个团队，每个用户只能属于一个团队' });
      return;
    }
    
    // 检查团队名称是否已存在
    const existingTeam = await Team.findOne({ where: { name } });
    if (existingTeam) {
      res.status(400).json({ message: '团队名称已存在' });
      return;
    }
    
    // 创建新团队
    const team = new Team();
    team.name = name;
    team.description = description;
    team.createdBy = userId;
    await team.save();
    
    // 将创建者添加为团队拥有者
    const teamMember = new TeamMember();
    teamMember.teamId = team.id;
    teamMember.userId = userId;
    teamMember.role = 'owner';
    await teamMember.save();
    
    res.status(201).json({
      message: '团队创建成功',
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        createdAt: team.createdAt,
        userRole: 'owner'
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队是否存在
    const team = await Team.findOne({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ message: '团队不存在' });
      return;
    }
    
    // 获取团队成员
    const members = await TeamMember.find({ where: { teamId } });
    
    // 获取成员用户信息
    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await User.findOne({ where: { id: member.userId } });
        return {
          id: member.id,
          userId: member.userId,
          username: user?.username,
          email: user?.email,
          role: member.role,
          createdAt: member.createdAt
        };
      })
    );
    
    res.status(200).json({
      id: team.id,
      name: team.name,
      description: team.description,
      createdBy: team.createdBy,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: memberDetails,
      userRole: teamMember.role
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 更新团队信息
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    if (teamMember.role !== 'owner' && teamMember.role !== 'admin') {
      res.status(403).json({ message: '无权更新团队信息' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队是否存在
    const team = await Team.findOne({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ message: '团队不存在' });
      return;
    }
    
    // 检查团队名称是否已被其他团队使用
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ where: { name } });
      if (existingTeam) {
        res.status(400).json({ message: '团队名称已存在' });
        return;
      }
      team.name = name;
    }
    
    if (description) {
      team.description = description;
    }
    
    await team.save();
    
    res.status(200).json({
      message: '团队更新成功',
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        updatedAt: team.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ 
      where: { 
        userId: userId,
        role: 'owner'
      }
    });
    
    if (!teamMember) {
      res.status(403).json({ message: '您不是团队拥有者，无权删除团队' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队是否存在
    const team = await Team.findOne({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ message: '团队不存在' });
      return;
    }
    
    // 删除团队成员
    await TeamMember.delete({ teamId });
    
    // 删除团队
    await Team.delete({ id: teamId });
    
    res.status(200).json({ message: '团队删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取团队成员列表
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 获取团队成员
    const members = await TeamMember.find({ where: { teamId } });
    
    // 获取成员用户信息
    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await User.findOne({ where: { id: member.userId } });
        return {
          id: member.id,
          userId: member.userId,
          username: user?.username,
          email: user?.email,
          role: member.role,
          createdAt: member.createdAt
        };
      })
    );
    
    res.status(200).json(memberDetails);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 添加团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    if (teamMember.role !== 'owner' && teamMember.role !== 'admin') {
      res.status(403).json({ message: '无权添加团队成员' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队是否存在
    const team = await Team.findOne({ where: { id: teamId } });
    if (!team) {
      res.status(404).json({ message: '团队不存在' });
      return;
    }
    
    // 通过用户名查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    const memberUserId = user.id;
    
    // 检查用户是否已是团队成员
    const existingMembership = await TeamMember.findOne({ where: { userId: memberUserId } });
    if (existingMembership) {
      res.status(400).json({ message: '该用户已加入其他团队' });
      return;
    }
    
    // 添加团队成员
    const newTeamMember = new TeamMember();
    newTeamMember.teamId = teamId;
    newTeamMember.userId = memberUserId;
    newTeamMember.role = 'member';
    await newTeamMember.save();
    
    res.status(201).json({
      message: '团队成员添加成功',
      member: {
        id: newTeamMember.id,
        userId: memberUserId,
        username: user.username,
        email: user.email,
        role: 'member',
        createdAt: newTeamMember.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 更新团队成员角色
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTeamMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ 
      where: { 
        userId: userId,
        role: 'owner'
      }
    });
    
    if (!teamMember) {
      res.status(403).json({ message: '您不是团队拥有者，无权更新成员角色' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队成员是否存在
    const member = await TeamMember.findOne({ where: { id: parseInt(memberId), teamId } });
    if (!member) {
      res.status(404).json({ message: '团队成员不存在' });
      return;
    }
    
    // 检查角色是否有效
    if (!['admin', 'member'].includes(role)) {
      res.status(400).json({ message: '无效的角色' });
      return;
    }
    
    // 更新成员角色
    member.role = role as 'admin' | 'member';
    await member.save();
    
    // 获取成员用户信息
    const user = await User.findOne({ where: { id: member.userId } });
    
    res.status(200).json({
      message: '团队成员角色更新成功',
      member: {
        id: member.id,
        userId: member.userId,
        username: user?.username,
        email: user?.email,
        role: member.role,
        createdAt: member.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 移除团队成员
 * @param req 请求对象
 * @param res 响应对象
 */
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    const teamId = teamMember.teamId;
    
    // 检查团队成员是否存在
    const member = await TeamMember.findOne({ where: { id: parseInt(memberId), teamId } });
    if (!member) {
      res.status(404).json({ message: '团队成员不存在' });
      return;
    }
    
    // 检查是否尝试移除团队拥有者
    if (member.role === 'owner') {
      res.status(403).json({ message: '无法移除团队拥有者' });
      return;
    }
    
    // 检查权限
    if (teamMember.role !== 'owner' && teamMember.role !== 'admin') {
      // 用户可以移除自己
      if (member.userId !== userId) {
        res.status(403).json({ message: '无权移除团队成员' });
        return;
      }
    }
    
    // 移除团队成员
    await TeamMember.delete({ id: parseInt(memberId) });
    
    res.status(200).json({ message: '团队成员移除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 退出团队
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    // 检查是否是团队拥有者
    if (teamMember.role === 'owner') {
      res.status(400).json({ message: '团队拥有者不能退出团队，请先转让团队或删除团队' });
      return;
    }
    
    // 退出团队
    await TeamMember.delete({ userId: userId });
    
    res.status(200).json({ message: '已成功退出团队' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * 获取可邀请的用户列表
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
    
    // 查找用户所在的团队
    const teamMember = await TeamMember.findOne({ where: { userId: userId } });
    
    if (!teamMember) {
      res.status(404).json({ message: '您尚未加入任何团队' });
      return;
    }
    
    // 获取已在团队中的用户ID
    const teamMembers = await TeamMember.find();
    const teamMemberUserIds = teamMembers.map(member => member.userId);
    
    // 获取未加入任何团队的用户
    const invitableUsers = await User.find({
      where: {
        id: teamMemberUserIds.length > 0 ? Not(In(teamMemberUserIds)) : undefined
      },
      select: ['id', 'username', 'email']
    });
    
    res.status(200).json(invitableUsers);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};
