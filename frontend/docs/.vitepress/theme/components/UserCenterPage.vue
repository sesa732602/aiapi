/**
 * 用户中心页面组件
 */
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';

// 国际化
const { t } = useI18n();

// 加载状态
const loading = ref(true);

// 用户信息
const userInfo = ref({
  id: '',
  username: '',
  email: '',
  role: '',
  createdAt: ''
});

// 我的API列表
const myApis = ref([]);

// 我的团队列表
const myTeams = ref([]);

// 我的订单列表
const myOrders = ref([]);

// 修改密码对话框
const changePasswordVisible = ref(false);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 编辑个人资料对话框
const editProfileVisible = ref(false);
const profileForm = ref({
  username: '',
  email: ''
});

// 当前激活的标签页
const activeTab = ref('profile');

// 表单规则
const passwordRules = {
  oldPassword: [
    { required: true, message: t('user.oldPassword') + t('common.required'), trigger: 'blur' },
    { min: 6, max: 30, message: t('login.passwordLength'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('user.newPassword') + t('common.required'), trigger: 'blur' },
    { min: 6, max: 30, message: t('login.passwordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('user.confirmPassword') + t('common.required'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error(t('register.passwordMismatch')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const profileRules = {
  username: [
    { required: true, message: t('user.username') + t('common.required'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.usernameLength'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('user.email') + t('common.required'), trigger: 'blur' },
    { type: 'email', message: t('register.emailInvalid'), trigger: 'blur' }
  ]
};

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const response = await api.getCurrentUser();
    
    // 模拟数据
    setTimeout(() => {
      userInfo.value = {
        id: '1',
        username: 'Admin',
        email: 'admin@example.com',
        role: 'super_admin',
        createdAt: '2025-05-01T10:00:00Z'
      };
      
      // 更新编辑表单
      profileForm.value = {
        username: userInfo.value.username,
        email: userInfo.value.email
      };
      
      loading.value = false;
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 加载我的API
const loadMyApis = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getMyApis();
    
    // 模拟数据
    setTimeout(() => {
      myApis.value = [
        {
          id: '1',
          name: '用户认证API',
          description: '提供用户登录、注册、认证等功能',
          path: '/api/auth',
          method: 'POST',
          teamName: '开发团队',
          createdAt: '2025-05-20T10:30:00Z'
        },
        {
          id: '2',
          name: '产品API',
          description: '提供产品查询、创建、更新等功能',
          path: '/api/products',
          method: 'GET',
          teamName: '开发团队',
          createdAt: '2025-05-19T09:15:00Z'
        }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 加载我的团队
const loadMyTeams = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getMyTeams();
    
    // 模拟数据
    setTimeout(() => {
      myTeams.value = [
        {
          id: '1',
          name: '开发团队',
          description: '负责产品开发和技术实现',
          role: 'owner',
          createdAt: '2025-05-15T10:30:00Z'
        },
        {
          id: '2',
          name: '业务团队',
          description: '负责业务需求和产品规划',
          role: 'member',
          createdAt: '2025-05-14T09:15:00Z'
        }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 加载我的订单
const loadMyOrders = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getMyOrders();
    
    // 模拟数据
    setTimeout(() => {
      myOrders.value = [
        {
          id: '1',
          apiName: '用户认证API',
          planName: '基础套餐',
          amount: 99,
          status: 'paid',
          createdAt: '2025-05-20T10:30:00Z'
        },
        {
          id: '2',
          apiName: '产品API',
          planName: '专业套餐',
          amount: 299,
          status: 'pending',
          createdAt: '2025-05-19T09:15:00Z'
        }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordVisible.value = true;
};

// 打开编辑个人资料对话框
const openEditProfileDialog = () => {
  profileForm.value = {
    username: userInfo.value.username,
    email: userInfo.value.email
  };
  editProfileVisible.value = true;
};

// 修改密码
const changePassword = async () => {
  try {
    // 这里应该调用实际的API
    // await api.changePassword(passwordForm.value);
    
    // 模拟修改成功
    setTimeout(() => {
      ElMessage.success(t('user.passwordChangeSuccess'));
      changePasswordVisible.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error(t('user.passwordChangeFailed'));
  }
};

// 更新个人资料
const updateProfile = async () => {
  try {
    // 这里应该调用实际的API
    // await api.updateProfile(profileForm.value);
    
    // 模拟更新成功
    setTimeout(() => {
      ElMessage.success(t('user.updateSuccess'));
      editProfileVisible.value = false;
      
      // 更新本地数据
      userInfo.value.username = profileForm.value.username;
      userInfo.value.email = profileForm.value.email;
    }, 500);
  } catch (error) {
    ElMessage.error(t('user.updateFailed'));
  }
};

// 处理标签页切换
const handleTabChange = (tab) => {
  activeTab.value = tab;
  
  // 根据标签页加载不同数据
  switch (tab) {
    case 'apis':
      loadMyApis();
      break;
    case 'teams':
      loadMyTeams();
      break;
    case 'orders':
      loadMyOrders();
      break;
  }
};

// 获取角色显示文本
const getRoleText = (role) => {
  switch (role) {
    case 'super_admin':
      return t('user.superAdmin');
    case 'admin':
      return t('user.admin');
    default:
      return role;
  }
};

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'info';
    case 'refunded':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取订单状态显示文本
const getOrderStatusText = (status) => {
  switch (status) {
    case 'pending':
      return t('order.pending');
    case 'paid':
      return t('order.paid');
    case 'cancelled':
      return t('order.cancelled');
    case 'refunded':
      return t('order.refunded');
    default:
      return status;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadUserInfo();
});
</script>

<template>
  <div class="user-center-container">
    <div class="page-header">
      <h1>{{ t('user.center') }}</h1>
    </div>
    
    <el-row :gutter="20">
      <el-col :xs="24" :md="8" :lg="6">
        <el-card shadow="never" class="user-card">
          <div v-loading="loading" class="user-info">
            <div class="avatar">
              <el-avatar :size="100" icon="UserFilled" />
            </div>
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="email">{{ userInfo.email }}</p>
            <p class="role">
              <el-tag :type="userInfo.role === 'super_admin' ? 'danger' : 'primary'">
                {{ getRoleText(userInfo.role) }}
              </el-tag>
            </p>
            <div class="actions">
              <el-button type="primary" @click="openEditProfileDialog">
                {{ t('user.updateProfile') }}
              </el-button>
              <el-button @click="openChangePasswordDialog">
                {{ t('user.changePassword') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="16" :lg="18">
        <el-card shadow="never" class="content-card">
          <el-tabs v-model="activeTab" @tab-click="handleTabChange">
            <el-tab-pane :label="t('user.profile')" name="profile">
              <div v-loading="loading" class="profile-content">
                <div class="info-item">
                  <span class="label">{{ t('user.username') }}:</span>
                  <span class="value">{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('user.email') }}:</span>
                  <span class="value">{{ userInfo.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('user.role') }}:</span>
                  <span class="value">{{ getRoleText(userInfo.role) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ t('user.createTime') }}:</span>
                  <span class="value">{{ new Date(userInfo.createdAt).toLocaleString() }}</span>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="t('user.myApis')" name="apis">
              <el-table :data="myApis" border style="width: 100%">
                <el-table-column prop="name" :label="t('api.name')" min-width="150" />
                <el-table-column prop="description" :label="t('api.description')" min-width="200" show-overflow-tooltip />
                <el-table-column prop="path" :label="t('api.path')" min-width="150" show-overflow-tooltip />
                <el-table-column prop="method" :label="t('api.method')" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.method === 'GET' ? 'success' : row.method === 'POST' ? 'primary' : row.method === 'PUT' ? 'warning' : row.method === 'DELETE' ? 'danger' : 'info'"
                    >
                      {{ row.method }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="teamName" :label="t('api.team')" width="120" />
                <el-table-column :label="t('common.actions')" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" @click="$router.push(`/api/${row.id}`)">
                      {{ t('api.detail') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane :label="t('user.myTeams')" name="teams">
              <el-table :data="myTeams" border style="width: 100%">
                <el-table-column prop="name" :label="t('team.name')" min-width="150" />
                <el-table-column prop="description" :label="t('team.description')" min-width="200" show-overflow-tooltip />
                <el-table-column prop="role" :label="t('team.memberRole')" width="120">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.role === 'owner' ? 'danger' : row.role === 'admin' ? 'warning' : 'info'"
                    >
                      {{ row.role === 'owner' ? t('team.ownerRole') : row.role === 'admin' ? t('team.adminRole') : t('team.memberRole') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="t('common.actions')" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" @click="$router.push(`/team/${row.id}`)">
                      {{ t('team.detail') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane :label="t('user.myOrders')" name="orders">
              <el-table :data="myOrders" border style="width: 100%">
                <el-table-column prop="id" :label="t('order.id')" width="80" />
                <el-table-column prop="apiName" :label="t('order.api')" min-width="150" />
                <el-table-column prop="planName" :label="t('order.plan')" min-width="150" />
                <el-table-column prop="amount" :label="t('order.amount')" width="100">
                  <template #default="{ row }">
                    ¥{{ row.amount.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="t('order.status')" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getOrderStatusType(row.status)">
                      {{ getOrderStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" :label="t('order.createTime')" width="180">
                  <template #default="{ row }">
                    {{ new Date(row.createdAt).toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column :label="t('common.actions')" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" @click="$router.push(`/order/${row.id}`)">
                      {{ t('order.detail') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      :title="t('user.changePassword')"
      width="500px"
    >
      <el-form :model="passwordForm" label-width="140px" :rules="passwordRules">
        <el-form-item :label="t('user.oldPassword')" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        
        <el-form-item :label="t('user.newPassword')" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        
        <el-form-item :label="t('user.confirmPassword')" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="changePasswordVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="changePassword">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑个人资料对话框 -->
    <el-dialog
      v-model="editProfileVisible"
      :title="t('user.updateProfile')"
      width="500px"
    >
      <el-form :model="profileForm" label-width="100px" :rules="profileRules">
        <el-form-item :label="t('user.username')" prop="username">
          <el-input v-model="profileForm.username" />
        </el-form-item>
        
        <el-form-item :label="t('user.email')" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editProfileVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateProfile">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-center-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.avatar {
  margin-bottom: 15px;
}

.username {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.email {
  color: #606266;
  margin: 0 0 10px 0;
}

.role {
  margin: 0 0 20px 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.content-card {
  min-height: 500px;
}

.profile-content {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
}

.label {
  font-weight: 500;
  width: 120px;
  color: #606266;
}

.value {
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-card {
    margin-bottom: 20px;
  }
}
</style>
