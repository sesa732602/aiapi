/**
 * API服务
 * 处理API相关的业务逻辑，解耦控制器与模型的直接依赖
 */
import { In } from 'typeorm';
import { HttpMethod } from '../models/Api';

// 使用动态导入避免循环依赖
const getApiModel = async () => {
  const { Api } = await import('../models/Api');
  return Api;
};

const getApiVersionModel = async () => {
  const { ApiVersion } = await import('../models/ApiVersion');
  return ApiVersion;
};

const getApiPermissionModel = async () => {
  const { ApiPermission } = await import('../models/ApiPermission');
  return ApiPermission;
};

const getTeamModel = async () => {
  const { Team } = await import('../models/Team');
  return Team;
};

const getTeamMemberModel = async () => {
  const { TeamMember } = await import('../models/TeamMember');
  return TeamMember;
};

/**
 * 创建API
 */
export const createApi = async (
  userId: number,
  data: { name: string; description: string; path: string; method: string; teamId?: number }
) => {
  const Api = await getApiModel();
  const Team = await getTeamModel();
  const TeamMember = await getTeamMemberModel();
  
  // 检查API名称是否已存在
  const existingApi = await Api.findOne({ where: { name: data.name } });
  if (existingApi) {
    throw new Error('API名称已存在');
  }
  
  // 如果指定了团队，检查团队是否存在以及用户是否有权限
  if (data.teamId) {
    const teamIdNum = parseInt(data.teamId.toString(), 10);
    const team = await Team.findOne({ where: { id: teamIdNum } });
    if (!team) {
      throw new Error('团队不存在');
    }
    
    // 检查用户是否有权限在该团队创建API
    const teamMember = await TeamMember.findOne({ where: { teamId: teamIdNum, userId } });
    if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
      throw new Error('无权在该团队创建API');
    }
  }
  
  // 创建新API
  const api = new Api();
  api.name = data.name;
  api.description = data.description || '';
  api.path = data.path;
  api.method = data.method as HttpMethod;
  api.ownerId = userId;
  api.teamId = data.teamId ? parseInt(data.teamId.toString(), 10) : null;
  await api.save();
  
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    path: api.path,
    method: api.method,
    ownerId: api.ownerId,
    teamId: api.teamId,
    createdAt: api.createdAt
  };
};

/**
 * 获取API列表
 */
export const getApis = async (userId: number, teamId?: number) => {
  const Api = await getApiModel();
  const TeamMember = await getTeamMemberModel();
  
  let apis = [];
  
  if (teamId) {
    // 检查用户是否是团队成员
    const teamMember = await TeamMember.findOne({ where: { teamId, userId } });
    if (!teamMember) {
      throw new Error('您不是该团队的成员');
    }
    
    // 获取团队的API
    apis = await Api.find({ where: { teamId } });
  } else {
    // 获取用户拥有的API
    const ownedApis = await Api.find({ where: { ownerId: userId } });
    
    // 获取用户所在团队的API
    const teamMemberships = await TeamMember.find({ where: { userId } });
    const teamIds = teamMemberships.map(member => member.teamId);
    const teamApis = teamIds.length > 0 ? await Api.find({ where: { teamId: In(teamIds) } }) : [];
    
    // 合并并去重
    const apiMap = new Map();
    [...ownedApis, ...teamApis].forEach(api => {
      apiMap.set(api.id, api);
    });
    
    apis = Array.from(apiMap.values());
  }
  
  return apis.map(api => ({
    id: api.id,
    name: api.name,
    description: api.description,
    path: api.path,
    method: api.method,
    ownerId: api.ownerId,
    teamId: api.teamId,
    createdAt: api.createdAt
  }));
};

/**
 * 获取API详情
 */
export const getApiById = async (apiId: number, userId: number) => {
  const Api = await getApiModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限查看API
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember) {
        throw new Error('无权查看此API');
      }
    } else {
      throw new Error('无权查看此API');
    }
  }
  
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    path: api.path,
    method: api.method,
    ownerId: api.ownerId,
    teamId: api.teamId,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  };
};

/**
 * 更新API
 */
export const updateApi = async (
  apiId: number,
  userId: number,
  data: { name?: string; description?: string; path?: string; method?: string }
) => {
  const Api = await getApiModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限更新API
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权更新此API');
      }
    } else {
      throw new Error('无权更新此API');
    }
  }
  
  // 检查API名称是否已存在
  if (data.name && data.name !== api.name) {
    const existingApi = await Api.findOne({ where: { name: data.name } });
    if (existingApi) {
      throw new Error('API名称已存在');
    }
    api.name = data.name;
  }
  
  // 更新API信息
  if (data.description !== undefined) {
    api.description = data.description;
  }
  
  if (data.path) {
    api.path = data.path;
  }
  
  if (data.method) {
    api.method = data.method as HttpMethod;
  }
  
  await api.save();
  
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    path: api.path,
    method: api.method,
    ownerId: api.ownerId,
    teamId: api.teamId,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  };
};

/**
 * 删除API
 */
export const deleteApi = async (apiId: number, userId: number) => {
  const Api = await getApiModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限删除API
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权删除此API');
      }
    } else {
      throw new Error('无权删除此API');
    }
  }
  
  // 删除API
  await api.remove();
  
  return true;
};

/**
 * 创建API版本
 */
export const createApiVersion = async (
  apiId: number,
  userId: number,
  data: { version: string; description: string; spec: string }
) => {
  const Api = await getApiModel();
  const ApiVersion = await getApiVersionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限创建API版本
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权创建API版本');
      }
    } else {
      throw new Error('无权创建API版本');
    }
  }
  
  // 检查版本号是否已存在
  const existingVersion = await ApiVersion.findOne({ where: { apiId, version: data.version } });
  if (existingVersion) {
    throw new Error('版本号已存在');
  }
  
  // 创建新版本
  const apiVersion = new ApiVersion();
  apiVersion.apiId = apiId;
  apiVersion.version = data.version;
  apiVersion.description = data.description;
  apiVersion.spec = data.spec;
  apiVersion.createdBy = userId;
  await apiVersion.save();
  
  return {
    id: apiVersion.id,
    apiId: apiVersion.apiId,
    version: apiVersion.version,
    description: apiVersion.description,
    spec: apiVersion.spec,
    createdBy: apiVersion.createdBy,
    createdAt: apiVersion.createdAt
  };
};

/**
 * 获取API版本列表
 */
export const getApiVersions = async (apiId: number, userId: number) => {
  const Api = await getApiModel();
  const ApiVersion = await getApiVersionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限查看API版本
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember) {
        throw new Error('无权查看API版本');
      }
    } else {
      throw new Error('无权查看API版本');
    }
  }
  
  // 获取API版本列表
  const apiVersions = await ApiVersion.find({ where: { apiId } });
  
  return apiVersions.map(version => ({
    id: version.id,
    apiId: version.apiId,
    version: version.version,
    description: version.description,
    spec: version.spec,
    createdBy: version.createdBy,
    createdAt: version.createdAt
  }));
};

/**
 * 设置当前API版本
 */
export const setCurrentApiVersion = async (apiId: number, versionId: number, userId: number) => {
  const Api = await getApiModel();
  const ApiVersion = await getApiVersionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限设置当前版本
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权设置当前版本');
      }
    } else {
      throw new Error('无权设置当前版本');
    }
  }
  
  // 检查版本是否存在
  const apiVersion = await ApiVersion.findOne({ where: { id: versionId, apiId } });
  if (!apiVersion) {
    throw new Error('API版本不存在');
  }
  
  // 设置当前版本
  api.currentVersionId = versionId;
  await api.save();
  
  return {
    id: api.id,
    name: api.name,
    currentVersionId: api.currentVersionId
  };
};

/**
 * 添加API权限
 */
export const addApiPermission = async (
  apiId: number,
  userId: number,
  data: { type: string; targetId: number }
) => {
  const Api = await getApiModel();
  const ApiPermission = await getApiPermissionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限添加API权限
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权添加API权限');
      }
    } else {
      throw new Error('无权添加API权限');
    }
  }
  
  // 检查权限类型
  if (data.type !== 'user' && data.type !== 'team') {
    throw new Error('无效的权限类型');
  }
  
  // 检查权限是否已存在
  const existingPermission = await ApiPermission.findOne({
    where: {
      apiId,
      userId: data.type === 'user' ? data.targetId : undefined,
      teamId: data.type === 'team' ? data.targetId : undefined
    }
  });
  
  if (existingPermission) {
    throw new Error('权限已存在');
  }
  
  // 创建新权限
  const permission = new ApiPermission();
  permission.apiId = apiId;
  permission.type = data.type;
  permission.targetId = data.targetId;
  await permission.save();
  
  return {
    id: permission.id,
    apiId: permission.apiId,
    type: permission.type,
    targetId: permission.targetId,
    createdAt: permission.createdAt
  };
};

/**
 * 获取API权限列表
 */
export const getApiPermissions = async (apiId: number, userId: number) => {
  const Api = await getApiModel();
  const ApiPermission = await getApiPermissionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限查看API权限
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember) {
        throw new Error('无权查看API权限');
      }
    } else {
      throw new Error('无权查看API权限');
    }
  }
  
  // 获取API权限列表
  const permissions = await ApiPermission.find({ where: { apiId } });
  
  return permissions.map(permission => ({
    id: permission.id,
    apiId: permission.apiId,
    type: permission.type,
    targetId: permission.targetId,
    createdAt: permission.createdAt
  }));
};

/**
 * 删除API权限
 */
export const deleteApiPermission = async (apiId: number, permissionId: number, userId: number) => {
  const Api = await getApiModel();
  const ApiPermission = await getApiPermissionModel();
  const TeamMember = await getTeamMemberModel();
  
  // 查找API
  const api = await Api.findOne({ where: { id: apiId } });
  if (!api) {
    throw new Error('API不存在');
  }
  
  // 检查用户是否有权限删除API权限
  if (api.ownerId !== userId) {
    if (api.teamId) {
      const teamMember = await TeamMember.findOne({ where: { teamId: api.teamId, userId } });
      if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
        throw new Error('无权删除API权限');
      }
    } else {
      throw new Error('无权删除API权限');
    }
  }
  
  // 查找权限
  const permission = await ApiPermission.findOne({ where: { id: permissionId, apiId } });
  if (!permission) {
    throw new Error('权限不存在');
  }
  
  // 删除权限
  await permission.remove();
  
  return true;
};
