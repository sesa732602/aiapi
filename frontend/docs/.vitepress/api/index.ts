/**
 * API服务 - 前后端接口集成
 */
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api', // API基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token认证
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 用户认证相关API
 */
export const authApi = {
  /**
   * 用户注册
   * @param {Object} data - 注册信息
   * @returns {Promise}
   */
  register: (data) => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @returns {Promise}
   */
  login: (data) => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * 获取当前用户信息
   * @returns {Promise}
   */
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },

  /**
   * 用户登出
   * @returns {Promise}
   */
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * 修改密码
   * @param {Object} data - 密码信息
   * @returns {Promise}
   */
  changePassword: (data) => {
    return apiClient.post('/auth/change-password', data);
  },

  /**
   * 更新用户资料
   * @param {Object} data - 用户资料
   * @returns {Promise}
   */
  updateProfile: (data) => {
    return apiClient.put('/auth/profile', data);
  }
};

/**
 * 团队管理相关API
 */
export const teamApi = {
  /**
   * 创建团队
   * @param {Object} data - 团队信息
   * @returns {Promise}
   */
  createTeam: (data) => {
    return apiClient.post('/teams', data);
  },

  /**
   * 获取团队列表
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getTeams: (params) => {
    return apiClient.get('/teams', { params });
  },

  /**
   * 获取团队详情
   * @param {string} id - 团队ID
   * @returns {Promise}
   */
  getTeamById: (id) => {
    return apiClient.get(`/teams/${id}`);
  },

  /**
   * 更新团队信息
   * @param {string} id - 团队ID
   * @param {Object} data - 团队信息
   * @returns {Promise}
   */
  updateTeam: (id, data) => {
    return apiClient.put(`/teams/${id}`, data);
  },

  /**
   * 删除团队
   * @param {string} id - 团队ID
   * @returns {Promise}
   */
  deleteTeam: (id) => {
    return apiClient.delete(`/teams/${id}`);
  },

  /**
   * 添加团队成员
   * @param {string} id - 团队ID
   * @param {Object} data - 成员信息
   * @returns {Promise}
   */
  addTeamMember: (id, data) => {
    return apiClient.post(`/teams/${id}/members`, data);
  },

  /**
   * 移除团队成员
   * @param {string} id - 团队ID
   * @param {string} userId - 用户ID
   * @returns {Promise}
   */
  removeTeamMember: (id, userId) => {
    return apiClient.delete(`/teams/${id}/members/${userId}`);
  },

  /**
   * 更新团队成员角色
   * @param {string} id - 团队ID
   * @param {string} userId - 用户ID
   * @param {Object} data - 角色信息
   * @returns {Promise}
   */
  updateTeamMemberRole: (id, userId, data) => {
    return apiClient.put(`/teams/${id}/members/${userId}/role`, data);
  },

  /**
   * 获取团队成员列表
   * @param {string} id - 团队ID
   * @returns {Promise}
   */
  getTeamMembers: (id) => {
    return apiClient.get(`/teams/${id}/members`);
  },

  /**
   * 获取我的团队列表
   * @returns {Promise}
   */
  getMyTeams: () => {
    return apiClient.get('/teams', { params: { mine: true } });
  }
};

/**
 * API管理相关API
 */
export const apiManagementApi = {
  /**
   * 创建API
   * @param {Object} data - API信息
   * @returns {Promise}
   */
  createApi: (data) => {
    return apiClient.post('/apis', data);
  },

  /**
   * 获取API列表
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getApis: (params) => {
    return apiClient.get('/apis', { params });
  },

  /**
   * 获取API详情
   * @param {string} id - API ID
   * @returns {Promise}
   */
  getApiById: (id) => {
    return apiClient.get(`/apis/${id}`);
  },

  /**
   * 更新API信息
   * @param {string} id - API ID
   * @param {Object} data - API信息
   * @returns {Promise}
   */
  updateApi: (id, data) => {
    return apiClient.put(`/apis/${id}`, data);
  },

  /**
   * 删除API
   * @param {string} id - API ID
   * @returns {Promise}
   */
  deleteApi: (id) => {
    return apiClient.delete(`/apis/${id}`);
  },

  /**
   * 创建API版本
   * @param {string} id - API ID
   * @param {Object} data - 版本信息
   * @returns {Promise}
   */
  createApiVersion: (id, data) => {
    return apiClient.post(`/apis/${id}/versions`, data);
  },

  /**
   * 获取API版本列表
   * @param {string} id - API ID
   * @returns {Promise}
   */
  getApiVersions: (id) => {
    return apiClient.get(`/apis/${id}/versions`);
  },

  /**
   * 设置当前API版本
   * @param {string} id - API ID
   * @param {string} versionId - 版本ID
   * @returns {Promise}
   */
  setCurrentApiVersion: (id, versionId) => {
    return apiClient.put(`/apis/${id}/versions/${versionId}/current`);
  },

  /**
   * 添加API权限
   * @param {string} id - API ID
   * @param {Object} data - 权限信息
   * @returns {Promise}
   */
  addApiPermission: (id, data) => {
    return apiClient.post(`/apis/${id}/permissions`, data);
  },

  /**
   * 获取API权限列表
   * @param {string} id - API ID
   * @returns {Promise}
   */
  getApiPermissions: (id) => {
    return apiClient.get(`/apis/${id}/permissions`);
  },

  /**
   * 删除API权限
   * @param {string} id - API ID
   * @param {string} permissionId - 权限ID
   * @returns {Promise}
   */
  deleteApiPermission: (id, permissionId) => {
    return apiClient.delete(`/apis/${id}/permissions/${permissionId}`);
  },

  /**
   * 获取我的API列表
   * @returns {Promise}
   */
  getMyApis: () => {
    return apiClient.get('/apis', { params: { mine: true } });
  }
};

/**
 * API套餐相关API
 */
export const apiPlanApi = {
  /**
   * 创建API套餐
   * @param {string} id - API ID
   * @param {Object} data - 套餐信息
   * @returns {Promise}
   */
  createApiPlan: (id, data) => {
    return apiClient.post(`/apis/${id}/plans`, data);
  },

  /**
   * 获取API套餐列表
   * @param {string} id - API ID
   * @returns {Promise}
   */
  getApiPlans: (id) => {
    return apiClient.get(`/apis/${id}/plans`);
  },

  /**
   * 更新API套餐
   * @param {string} id - API ID
   * @param {string} planId - 套餐ID
   * @param {Object} data - 套餐信息
   * @returns {Promise}
   */
  updateApiPlan: (id, planId, data) => {
    return apiClient.put(`/apis/${id}/plans/${planId}`, data);
  },

  /**
   * 删除API套餐
   * @param {string} id - API ID
   * @param {string} planId - 套餐ID
   * @returns {Promise}
   */
  deleteApiPlan: (id, planId) => {
    return apiClient.delete(`/apis/${id}/plans/${planId}`);
  }
};

/**
 * 订单相关API
 */
export const orderApi = {
  /**
   * 创建订单
   * @param {Object} data - 订单信息
   * @returns {Promise}
   */
  createOrder: (data) => {
    return apiClient.post('/orders', data);
  },

  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getOrders: (params) => {
    return apiClient.get('/orders', { params });
  },

  /**
   * 获取订单详情
   * @param {string} id - 订单ID
   * @returns {Promise}
   */
  getOrderById: (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  /**
   * 支付订单
   * @param {string} id - 订单ID
   * @param {Object} data - 支付信息
   * @returns {Promise}
   */
  payOrder: (id, data) => {
    return apiClient.put(`/orders/${id}/pay`, data);
  },

  /**
   * 取消订单
   * @param {string} id - 订单ID
   * @returns {Promise}
   */
  cancelOrder: (id) => {
    return apiClient.put(`/orders/${id}/cancel`);
  },

  /**
   * 获取收入统计
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getRevenueStats: (params) => {
    return apiClient.get('/stats/revenue', { params });
  },

  /**
   * 获取我的订单列表
   * @returns {Promise}
   */
  getMyOrders: () => {
    return apiClient.get('/orders', { params: { mine: true } });
  }
};

/**
 * 统计相关API
 */
export const statsApi = {
  /**
   * 记录API调用
   * @param {Object} data - 调用信息
   * @returns {Promise}
   */
  recordApiCall: (data) => {
    return apiClient.post('/stats/calls', data);
  },

  /**
   * 获取API调用统计
   * @param {string} apiId - API ID
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getApiCallStats: (apiId, params) => {
    return apiClient.get(`/stats/apis/${apiId}/calls`, { params });
  },

  /**
   * 获取用户调用统计
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getUserCallStats: (params) => {
    return apiClient.get('/stats/users/calls', { params });
  },

  /**
   * 获取用户额度
   * @returns {Promise}
   */
  getUserQuotas: () => {
    return apiClient.get('/users/quotas');
  },

  /**
   * 充值用户额度
   * @param {Object} data - 充值信息
   * @returns {Promise}
   */
  rechargeUserQuota: (data) => {
    return apiClient.post('/users/quotas/recharge', data);
  }
};

// 导出所有API
export default {
  auth: authApi,
  team: teamApi,
  api: apiManagementApi,
  plan: apiPlanApi,
  order: orderApi,
  stats: statsApi
};
