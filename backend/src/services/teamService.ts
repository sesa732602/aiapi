/**
 * 团队服务
 * 处理团队相关的业务逻辑，解耦控制器与模型的直接依赖
 */
import { In } from 'typeorm';

// 使用动态导入避免循环依赖
const getTeamModel = async () => {
  const { Team } = await import('../models/Team');
  return Team;
};

const getTeamMemberModel = async () => {
  const { TeamMember } = await import('../models/TeamMember');
  return TeamMember;
};

const getUserModel = async () => {
  const { User } = await import('../models/User');
  return User;
};

/**
 * 创建团队
 */
export const createTeam = async (name: string, description: string, userId: number) => {
  const Team = await getTeamModel();
  
  // 检查团队名称是否已存在
  const existingTeam = await Team.findOne({ where: { name } });
  if (existingTeam) {
    throw new Error('团队名称已存在');
  }
  
  // 创建新团队
  const team = new Team();
  team.name = name;
  team.description = description;
  team.createdBy = userId;
  await team.save();
  
  // 添加创建者为团队所有者
  const TeamMember = await getTeamMemberModel();
  const teamMember = new TeamMember();
  teamMember.teamId = team.id;
  teamMember.userId = userId;
  teamMember.role = 'owner';
  await teamMember.save();
  
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    createdBy: team.createdBy,
    createdAt: team.createdAt
  };
};

/**
 * 获取用户所在的团队
 */
export const getUserTeams = async (userId: number) => {
  const TeamMember = await getTeamMemberModel();
  const Team = await getTeamModel();
  
  // 查找用户所在的团队
  const teamMembers = await TeamMember.find({ where: { userId } });
  if (!teamMembers.length) {
    return [];
  }
  
  const teamIds = teamMembers.map(member => member.teamId);
  const teams = await Team.find({ where: { id: In(teamIds) } });
  
  return teams.map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    role: teamMembers.find(member => member.teamId === team.id)?.role,
    createdAt: team.createdAt
  }));
};

/**
 * 获取团队详情
 */
export const getTeamDetails = async (teamId: number, userId: number) => {
  const Team = await getTeamModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找团队
  const team = await Team.findOne({ where: { id: teamId } });
  if (!team) {
    throw new Error('团队不存在');
  }
  
  // 检查用户是否是团队成员
  const teamMember = await TeamMember.findOne({ where: { teamId, userId } });
  if (!teamMember) {
    throw new Error('您不是该团队的成员');
  }
  
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    createdBy: team.createdBy,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    role: teamMember.role
  };
};

/**
 * 更新团队信息
 */
export const updateTeam = async (teamId: number, userId: number, data: { name?: string; description?: string }) => {
  const Team = await getTeamModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找团队
  const team = await Team.findOne({ where: { id: teamId } });
  if (!team) {
    throw new Error('团队不存在');
  }
  
  // 检查用户是否有权限更新团队
  const teamMember = await TeamMember.findOne({ where: { teamId, userId } });
  if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
    throw new Error('无权更新团队信息');
  }
  
  // 检查团队名称是否已存在
  if (data.name && data.name !== team.name) {
    const existingTeam = await Team.findOne({ where: { name: data.name } });
    if (existingTeam) {
      throw new Error('团队名称已存在');
    }
    team.name = data.name;
  }
  
  // 更新团队描述
  if (data.description !== undefined) {
    team.description = data.description;
  }
  
  await team.save();
  
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    createdBy: team.createdBy,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt
  };
};

/**
 * 删除团队
 */
export const deleteTeam = async (teamId: number, userId: number) => {
  const Team = await getTeamModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找团队
  const team = await Team.findOne({ where: { id: teamId } });
  if (!team) {
    throw new Error('团队不存在');
  }
  
  // 检查用户是否是团队所有者
  const teamMember = await TeamMember.findOne({ where: { teamId, userId } });
  if (!teamMember || teamMember.role !== 'owner') {
    throw new Error('只有团队所有者可以删除团队');
  }
  
  // 删除团队成员
  await TeamMember.delete({ teamId });
  
  // 删除团队
  await team.remove();
  
  return true;
};

/**
 * 获取团队成员
 */
export const getTeamMembers = async (teamId: number, userId: number) => {
  const TeamMember = await getTeamMemberModel();
  const User = await getUserModel();
  
  // 检查用户是否是团队成员
  const userMember = await TeamMember.findOne({ where: { teamId, userId } });
  if (!userMember) {
    throw new Error('您不是该团队的成员');
  }
  
  // 获取团队所有成员
  const teamMembers = await TeamMember.find({ where: { teamId } });
  const userIds = teamMembers.map(member => member.userId);
  const users = await User.find({ where: { id: In(userIds) } });
  
  return teamMembers.map(member => {
    const user = users.find(u => u.id === member.userId);
    return {
      id: member.id,
      userId: member.userId,
      username: user?.username,
      email: user?.email,
      avatar: user?.avatar,
      role: member.role,
      joinedAt: member.createdAt
    };
  });
};

/**
 * 添加团队成员
 */
export const addTeamMember = async (teamId: number, currentUserId: number, newMemberEmail: string, role: 'admin' | 'member') => {
  const Team = await getTeamModel();
  const TeamMember = await getTeamMemberModel();
  const User = await getUserModel();
  
  // 查找团队
  const team = await Team.findOne({ where: { id: teamId } });
  if (!team) {
    throw new Error('团队不存在');
  }
  
  // 检查当前用户是否有权限添加成员
  const currentMember = await TeamMember.findOne({ where: { teamId, userId: currentUserId } });
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('无权添加团队成员');
  }
  
  // 查找要添加的用户
  const newUser = await User.findOne({ where: { email: newMemberEmail } });
  if (!newUser) {
    throw new Error('用户不存在');
  }
  
  // 检查用户是否已经是团队成员
  const existingMember = await TeamMember.findOne({ where: { teamId, userId: newUser.id } });
  if (existingMember) {
    throw new Error('用户已经是团队成员');
  }
  
  // 添加新成员
  const teamMember = new TeamMember();
  teamMember.teamId = teamId;
  teamMember.userId = newUser.id;
  teamMember.role = role;
  await teamMember.save();
  
  return {
    id: teamMember.id,
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    role: teamMember.role,
    joinedAt: teamMember.createdAt
  };
};

/**
 * 更新团队成员角色
 */
export const updateTeamMemberRole = async (teamId: number, currentUserId: number, memberId: number, newRole: 'admin' | 'member') => {
  const TeamMember = await getTeamMemberModel();
  const User = await getUserModel();
  
  // 检查当前用户是否有权限更新成员角色
  const currentMember = await TeamMember.findOne({ where: { teamId, userId: currentUserId } });
  if (!currentMember || currentMember.role !== 'owner') {
    throw new Error('只有团队所有者可以更新成员角色');
  }
  
  // 查找要更新的成员
  const member = await TeamMember.findOne({ where: { id: memberId, teamId } });
  if (!member) {
    throw new Error('成员不存在');
  }
  
  // 不能更改所有者角色
  if (member.role === 'owner') {
    throw new Error('不能更改所有者角色');
  }
  
  // 更新角色
  member.role = newRole;
  await member.save();
  
  // 获取用户信息
  const user = await User.findOne({ where: { id: member.userId } });
  
  return {
    id: member.id,
    userId: member.userId,
    username: user?.username,
    email: user?.email,
    avatar: user?.avatar,
    role: member.role,
    joinedAt: member.createdAt
  };
};

/**
 * 移除团队成员
 */
export const removeTeamMember = async (teamId: number, currentUserId: number, memberId: number) => {
  const TeamMember = await getTeamMemberModel();
  
  // 检查当前用户是否有权限移除成员
  const currentMember = await TeamMember.findOne({ where: { teamId, userId: currentUserId } });
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('无权移除团队成员');
  }
  
  // 查找要移除的成员
  const member = await TeamMember.findOne({ where: { id: memberId, teamId } });
  if (!member) {
    throw new Error('成员不存在');
  }
  
  // 不能移除所有者
  if (member.role === 'owner') {
    throw new Error('不能移除团队所有者');
  }
  
  // 管理员不能移除其他管理员
  if (currentMember.role === 'admin' && member.role === 'admin') {
    throw new Error('管理员不能移除其他管理员');
  }
  
  // 移除成员
  await member.remove();
  
  return true;
};

/**
 * 离开团队
 */
export const leaveTeam = async (teamId: number, userId: number) => {
  const TeamMember = await getTeamMemberModel();
  
  // 查找成员
  const member = await TeamMember.findOne({ where: { teamId, userId } });
  if (!member) {
    throw new Error('您不是该团队的成员');
  }
  
  // 所有者不能离开团队
  if (member.role === 'owner') {
    throw new Error('团队所有者不能离开团队，请先转让所有权');
  }
  
  // 离开团队
  await member.remove();
  
  return true;
};

/**
 * 获取可邀请的用户
 */
export const getInvitableUsers = async (teamId: number, userId: number, query: string) => {
  const TeamMember = await getTeamMemberModel();
  const User = await getUserModel();
  
  // 检查当前用户是否有权限邀请成员
  const currentMember = await TeamMember.findOne({ where: { teamId, userId } });
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('无权邀请团队成员');
  }
  
  // 获取团队现有成员ID
  const teamMembers = await TeamMember.find({ where: { teamId } });
  const teamMemberUserIds = teamMembers.map(member => member.userId);
  
  // 查找符合条件的用户
  let users;
  if (query) {
    users = await User.find({
      where: [
        { username: query },
        { email: query }
      ]
    });
  } else {
    users = await User.find();
  }
  
  // 过滤掉已经是团队成员的用户
  const invitableUsers = users.filter(user => !teamMemberUserIds.includes(user.id));
  
  return invitableUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar
  }));
};
