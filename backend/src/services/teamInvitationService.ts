/**
 * 团队邀请服务
 * 处理团队邀请相关的业务逻辑
 */
import { LessThan, In } from 'typeorm';
import { TeamInvitation, InvitationStatus } from '../models/TeamInvitation';
import { TeamMemberRole } from '../models/TeamMember';

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
 * 创建团队邀请
 */
export const createInvitation = async (
  teamId: number,
  inviterId: number,
  inviteeEmail: string,
  role: TeamMemberRole,
  message?: string
) => {
  const Team = await getTeamModel();
  const User = await getUserModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找团队
  const team = await Team.findOne({ where: { id: teamId } });
  if (!team) {
    throw new Error('团队不存在');
  }
  
  // 检查邀请人是否有权限邀请成员
  const inviterMember = await TeamMember.findOne({ where: { teamId, userId: inviterId } });
  if (!inviterMember || (inviterMember.role !== 'owner' && inviterMember.role !== 'admin')) {
    throw new Error('无权邀请团队成员');
  }
  
  // 查找被邀请人
  const invitee = await User.findOne({ where: { email: inviteeEmail } });
  if (!invitee) {
    throw new Error('被邀请用户不存在');
  }
  
  // 检查被邀请人是否已经是团队成员
  const existingMember = await TeamMember.findOne({ where: { teamId, userId: invitee.id } });
  if (existingMember) {
    throw new Error('用户已经是团队成员');
  }
  
  // 检查是否已有待处理的邀请
  const existingInvitation = await TeamInvitation.findOne({
    where: {
      teamId,
      inviteeId: invitee.id,
      status: InvitationStatus.PENDING
    }
  });
  
  if (existingInvitation) {
    throw new Error('已有待处理的邀请');
  }
  
  // 创建邀请
  const invitation = new TeamInvitation();
  invitation.teamId = teamId;
  invitation.inviterId = inviterId;
  invitation.inviteeId = invitee.id;
  invitation.role = role;
  invitation.message = message || ''; // 确保message不为undefined
  invitation.status = InvitationStatus.PENDING; // 显式初始化状态
  
  // 设置过期时间（7天后）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  invitation.expiresAt = expiresAt;
  
  // 初始化其他必要字段
  invitation.respondedAt = null;
  
  await invitation.save();
  
  return {
    id: invitation.id,
    teamId: invitation.teamId,
    teamName: team.name,
    inviterId: invitation.inviterId,
    inviteeId: invitation.inviteeId,
    inviteeEmail: invitee.email,
    status: invitation.status,
    role: invitation.role,
    message: invitation.message,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt
  };
};

/**
 * 获取用户收到的邀请
 */
export const getUserInvitations = async (userId: number) => {
  const Team = await getTeamModel();
  const User = await getUserModel();
  
  // 查找用户收到的邀请
  const invitations = await TeamInvitation.find({
    where: {
      inviteeId: userId,
      status: InvitationStatus.PENDING
    },
    order: {
      createdAt: 'DESC'
    }
  });
  
  // 更新过期的邀请
  const now = new Date();
  const expiredInvitations = invitations.filter(inv => inv.expiresAt < now);
  
  if (expiredInvitations.length > 0) {
    const expiredIds = expiredInvitations.map(inv => inv.id);
    await TeamInvitation.update(
      { id: In(expiredIds) }, // 使用In操作符修复类型错误
      { status: InvitationStatus.EXPIRED }
    );
  }
  
  // 获取有效的邀请
  const validInvitations = invitations.filter(inv => inv.expiresAt >= now);
  
  // 获取相关团队和邀请人信息
  const teamIds = [...new Set(validInvitations.map(inv => inv.teamId))];
  const inviterIds = [...new Set(validInvitations.map(inv => inv.inviterId))];
  
  const teams = await Team.find({ where: { id: In(teamIds) } }); // 使用In操作符修复类型错误
  const inviters = await User.find({ where: { id: In(inviterIds) } }); // 使用In操作符修复类型错误
  
  return validInvitations.map(invitation => {
    const team = teams.find(t => t.id === invitation.teamId);
    const inviter = inviters.find(u => u.id === invitation.inviterId);
    
    return {
      id: invitation.id,
      teamId: invitation.teamId,
      teamName: team?.name,
      inviterId: invitation.inviterId,
      inviterName: inviter?.username,
      inviterEmail: inviter?.email,
      status: invitation.status,
      role: invitation.role,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt
    };
  });
};

/**
 * 获取团队发出的邀请
 */
export const getTeamInvitations = async (teamId: number, currentUserId: number) => {
  const TeamMember = await getTeamMemberModel();
  const User = await getUserModel();
  
  // 检查当前用户是否有权限查看团队邀请
  const currentMember = await TeamMember.findOne({ where: { teamId, userId: currentUserId } });
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
    throw new Error('无权查看团队邀请');
  }
  
  // 查找团队发出的邀请
  const invitations = await TeamInvitation.find({
    where: {
      teamId,
      status: InvitationStatus.PENDING
    },
    order: {
      createdAt: 'DESC'
    }
  });
  
  // 更新过期的邀请
  const now = new Date();
  const expiredInvitations = invitations.filter(inv => inv.expiresAt < now);
  
  if (expiredInvitations.length > 0) {
    const expiredIds = expiredInvitations.map(inv => inv.id);
    await TeamInvitation.update(
      { id: In(expiredIds) }, // 使用In操作符修复类型错误
      { status: InvitationStatus.EXPIRED }
    );
  }
  
  // 获取有效的邀请
  const validInvitations = invitations.filter(inv => inv.expiresAt >= now);
  
  // 获取被邀请人和邀请人信息
  const userIds = [
    ...new Set([
      ...validInvitations.map(inv => inv.inviteeId),
      ...validInvitations.map(inv => inv.inviterId)
    ])
  ];
  
  const users = await User.find({ where: { id: In(userIds) } }); // 使用In操作符修复类型错误
  
  return validInvitations.map(invitation => {
    const invitee = users.find(u => u.id === invitation.inviteeId);
    const inviter = users.find(u => u.id === invitation.inviterId);
    
    return {
      id: invitation.id,
      inviteeId: invitation.inviteeId,
      inviteeName: invitee?.username,
      inviteeEmail: invitee?.email,
      inviterId: invitation.inviterId,
      inviterName: inviter?.username,
      status: invitation.status,
      role: invitation.role,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt
    };
  });
};

/**
 * 接受团队邀请
 */
export const acceptInvitation = async (invitationId: number, userId: number) => {
  const TeamMember = await getTeamMemberModel();
  
  // 查找邀请
  const invitation = await TeamInvitation.findOne({
    where: {
      id: invitationId,
      inviteeId: userId,
      status: InvitationStatus.PENDING
    }
  });
  
  if (!invitation) {
    throw new Error('邀请不存在或已过期');
  }
  
  // 检查邀请是否过期
  if (invitation.expiresAt < new Date()) {
    invitation.status = InvitationStatus.EXPIRED;
    await invitation.save();
    throw new Error('邀请已过期');
  }
  
  // 检查用户是否已经是团队成员
  const existingMember = await TeamMember.findOne({
    where: {
      teamId: invitation.teamId,
      userId
    }
  });
  
  if (existingMember) {
    throw new Error('您已经是团队成员');
  }
  
  // 更新邀请状态
  invitation.status = InvitationStatus.ACCEPTED;
  invitation.respondedAt = new Date();
  await invitation.save();
  
  // 添加用户到团队
  const teamMember = new TeamMember();
  teamMember.teamId = invitation.teamId;
  teamMember.userId = userId;
  teamMember.role = invitation.role as TeamMemberRole; // 类型转换确保兼容
  await teamMember.save();
  
  return {
    id: teamMember.id,
    teamId: teamMember.teamId,
    userId: teamMember.userId,
    role: teamMember.role,
    joinedAt: teamMember.createdAt
  };
};

/**
 * 拒绝团队邀请
 */
export const rejectInvitation = async (invitationId: number, userId: number) => {
  // 查找邀请
  const invitation = await TeamInvitation.findOne({
    where: {
      id: invitationId,
      inviteeId: userId,
      status: InvitationStatus.PENDING
    }
  });
  
  if (!invitation) {
    throw new Error('邀请不存在或已过期');
  }
  
  // 更新邀请状态
  invitation.status = InvitationStatus.REJECTED;
  invitation.respondedAt = new Date();
  await invitation.save();
  
  return {
    id: invitation.id,
    status: invitation.status,
    respondedAt: invitation.respondedAt
  };
};

/**
 * 取消团队邀请
 */
export const cancelInvitation = async (invitationId: number, currentUserId: number) => {
  const TeamMember = await getTeamMemberModel();
  
  // 查找邀请
  const invitation = await TeamInvitation.findOne({
    where: {
      id: invitationId,
      status: InvitationStatus.PENDING
    }
  });
  
  if (!invitation) {
    throw new Error('邀请不存在或已处理');
  }
  
  // 检查当前用户是否有权限取消邀请
  const currentMember = await TeamMember.findOne({
    where: {
      teamId: invitation.teamId,
      userId: currentUserId
    }
  });
  
  if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin' && currentUserId !== invitation.inviterId)) {
    throw new Error('无权取消邀请');
  }
  
  // 删除邀请
  await invitation.remove();
  
  return { success: true };
};

/**
 * 清理过期邀请
 */
export const cleanupExpiredInvitations = async () => {
  const now = new Date();
  
  // 更新过期的邀请状态
  await TeamInvitation.update(
    {
      status: InvitationStatus.PENDING,
      expiresAt: LessThan(now)
    },
    {
      status: InvitationStatus.EXPIRED
    }
  );
  
  return { success: true };
};
