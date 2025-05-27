/**
 * 团队管理页面组件 - 每个用户只能管理一个团队
 */
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 国际化
const { t } = useI18n();

// 当前用户的团队
const userTeam = ref(null);

// 加载状态
const loading = ref(true);

// 对话框控制
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const memberDialogVisible = ref(false);
const addMemberDialogVisible = ref(false);

// 当前编辑的团队
const currentTeam = ref({
  id: '',
  name: '',
  description: '',
  ownerId: '',
  ownerName: ''
});

// 当前团队的成员列表
const teamMembers = ref([]);

// 新成员信息
const newMember = ref({
  username: ''
});

// 已注册用户列表（用于选择添加成员）
const registeredUsers = ref([]);

// 表单规则
const rules = {
  name: [
    { required: true, message: t('team.name') + t('common.required'), trigger: 'blur' },
    { min: 2, max: 50, message: t('team.name') + ' 长度应为 2-50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('team.description') + t('common.required'), trigger: 'blur' }
  ],
  username: [
    { required: true, message: t('user.username') + t('common.required'), trigger: 'blur' }
  ]
};

// 是否是团队拥有者或管理员
const isTeamAdmin = computed(() => {
  if (!userTeam.value) return false;
  return userTeam.value.userRole === 'owner' || userTeam.value.userRole === 'admin';
});

// 是否是团队拥有者
const isTeamOwner = computed(() => {
  if (!userTeam.value) return false;
  return userTeam.value.userRole === 'owner';
});

// 加载用户团队
const loadUserTeam = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const response = await api.getUserTeam();
    
    // 模拟数据
    setTimeout(() => {
      // 检查本地存储中是否有团队信息
      const localTeams = localStorage.getItem('teams');
      const localUsers = localStorage.getItem('users');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (localTeams && localUsers && currentUser && currentUser.id) {
        const teams = JSON.parse(localTeams);
        const users = JSON.parse(localUsers);
        
        // 查找当前用户的团队
        const userTeamMembership = teams.memberships?.find(m => m.userId === currentUser.id);
        
        if (userTeamMembership) {
          // 用户已有团队
          const team = teams.list?.find(t => t.id === userTeamMembership.teamId);
          if (team) {
            userTeam.value = {
              ...team,
              userRole: userTeamMembership.role
            };
          }
        }
        
        // 获取所有已注册用户（排除已在团队中的用户）
        if (users && users.list) {
          const teamMemberIds = teams.memberships
            ?.filter(m => m.teamId === userTeam.value?.id)
            .map(m => m.userId) || [];
          
          registeredUsers.value = users.list
            .filter(u => !teamMemberIds.includes(u.id) && u.id !== currentUser.id)
            .map(u => ({
              id: u.id,
              username: u.username,
              email: u.email
            }));
        }
      }
      
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 加载团队成员
const loadTeamMembers = async () => {
  if (!userTeam.value) return;
  
  try {
    // 这里应该调用实际的API
    // const response = await api.getTeamMembers(userTeam.value.id);
    
    // 模拟数据
    setTimeout(() => {
      const localTeams = localStorage.getItem('teams');
      const localUsers = localStorage.getItem('users');
      
      if (localTeams && localUsers && userTeam.value) {
        const teams = JSON.parse(localTeams);
        const users = JSON.parse(localUsers);
        
        // 获取团队成员
        const memberships = teams.memberships?.filter(m => m.teamId === userTeam.value.id) || [];
        
        teamMembers.value = memberships.map(membership => {
          const user = users.list?.find(u => u.id === membership.userId);
          return {
            id: membership.id,
            userId: membership.userId,
            username: user?.username || 'Unknown',
            email: user?.email || '',
            role: membership.role,
            createdAt: membership.createdAt || new Date().toISOString()
          };
        });
      }
      
      memberDialogVisible.value = true;
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 打开创建团队对话框
const openCreateDialog = () => {
  currentTeam.value = {
    id: '',
    name: '',
    description: '',
    ownerId: '',
    ownerName: ''
  };
  createDialogVisible.value = true;
};

// 打开编辑团队对话框
const openEditDialog = () => {
  if (!userTeam.value) return;
  
  currentTeam.value = {
    id: userTeam.value.id,
    name: userTeam.value.name,
    description: userTeam.value.description,
    ownerId: userTeam.value.ownerId || '',
    ownerName: userTeam.value.ownerName || ''
  };
  editDialogVisible.value = true;
};

// 创建团队
const createTeam = async () => {
  try {
    // 这里应该调用实际的API
    // await api.createTeam(currentTeam.value);
    
    // 模拟创建成功
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser || !currentUser.id) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      // 获取或初始化本地存储
      const localTeams = localStorage.getItem('teams');
      let teams = localTeams ? JSON.parse(localTeams) : { list: [], memberships: [] };
      
      // 检查用户是否已有团队
      const existingMembership = teams.memberships?.find(m => m.userId === currentUser.id);
      if (existingMembership) {
        ElMessage.error('您已经拥有或加入了一个团队');
        createDialogVisible.value = false;
        return;
      }
      
      // 创建新团队
      const newTeamId = Date.now().toString();
      const newTeam = {
        id: newTeamId,
        name: currentTeam.value.name,
        description: currentTeam.value.description,
        ownerId: currentUser.id,
        ownerName: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 创建团队成员关系
      const newMembership = {
        id: `mem-${Date.now()}`,
        teamId: newTeamId,
        userId: currentUser.id,
        role: 'owner',
        createdAt: new Date().toISOString()
      };
      
      // 更新本地存储
      teams.list = [...(teams.list || []), newTeam];
      teams.memberships = [...(teams.memberships || []), newMembership];
      localStorage.setItem('teams', JSON.stringify(teams));
      
      ElMessage.success(t('team.createSuccess'));
      createDialogVisible.value = false;
      
      // 重新加载团队信息
      loadUserTeam();
    }, 500);
  } catch (error) {
    ElMessage.error(t('team.createFailed'));
  }
};

// 更新团队
const updateTeam = async () => {
  try {
    // 这里应该调用实际的API
    // await api.updateTeam(currentTeam.value.id, currentTeam.value);
    
    // 模拟更新成功
    setTimeout(() => {
      if (!userTeam.value) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      // 获取本地存储
      const localTeams = localStorage.getItem('teams');
      if (!localTeams) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      const teams = JSON.parse(localTeams);
      
      // 更新团队信息
      const teamIndex = teams.list?.findIndex(t => t.id === userTeam.value.id);
      if (teamIndex !== -1 && teamIndex !== undefined) {
        teams.list[teamIndex] = {
          ...teams.list[teamIndex],
          name: currentTeam.value.name,
          description: currentTeam.value.description,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // 更新当前团队信息
        userTeam.value = {
          ...userTeam.value,
          name: currentTeam.value.name,
          description: currentTeam.value.description
        };
        
        ElMessage.success(t('team.updateSuccess'));
        editDialogVisible.value = false;
      } else {
        ElMessage.error(t('common.error'));
      }
    }, 500);
  } catch (error) {
    ElMessage.error(t('team.updateFailed'));
  }
};

// 删除团队
const deleteTeam = async () => {
  try {
    if (!userTeam.value) return;
    
    await ElMessageBox.confirm(
      t('team.deleteConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    
    // 这里应该调用实际的API
    // await api.deleteTeam(userTeam.value.id);
    
    // 模拟删除成功
    setTimeout(() => {
      // 获取本地存储
      const localTeams = localStorage.getItem('teams');
      if (!localTeams) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      const teams = JSON.parse(localTeams);
      
      // 删除团队及其成员关系
      const teamId = userTeam.value.id;
      teams.list = teams.list?.filter(t => t.id !== teamId) || [];
      teams.memberships = teams.memberships?.filter(m => m.teamId !== teamId) || [];
      
      localStorage.setItem('teams', JSON.stringify(teams));
      
      ElMessage.success(t('team.deleteSuccess'));
      userTeam.value = null;
    }, 500);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('team.deleteFailed'));
    }
  }
};

// 打开成员管理对话框
const openMemberDialog = async () => {
  if (!userTeam.value) return;
  await loadTeamMembers();
};

// 打开添加成员对话框
const openAddMemberDialog = () => {
  newMember.value = {
    username: ''
  };
  
  // 加载可邀请的用户
  const localUsers = localStorage.getItem('users');
  const localTeams = localStorage.getItem('teams');
  
  if (localUsers && localTeams) {
    const users = JSON.parse(localUsers);
    const teams = JSON.parse(localTeams);
    
    // 获取所有已在团队中的用户ID
    const teamMemberUserIds = teams.memberships?.map(m => m.userId) || [];
    
    // 过滤出未加入任何团队的用户
    registeredUsers.value = users.list
      ?.filter(u => !teamMemberUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        username: u.username,
        email: u.email
      })) || [];
  }
  
  addMemberDialogVisible.value = true;
};

// 添加团队成员
const addTeamMember = async () => {
  try {
    if (!newMember.value.username) {
      ElMessage.error('请选择要添加的用户');
      return;
    }
    
    // 这里应该调用实际的API
    // await api.addTeamMember(userTeam.value.id, newMember.value);
    
    // 模拟添加成功
    setTimeout(() => {
      if (!userTeam.value) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      // 获取本地存储
      const localTeams = localStorage.getItem('teams');
      const localUsers = localStorage.getItem('users');
      
      if (!localTeams || !localUsers) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      const teams = JSON.parse(localTeams);
      const users = JSON.parse(localUsers);
      
      // 查找要添加的用户
      const user = users.list?.find(u => u.username === newMember.value.username);
      
      if (!user) {
        ElMessage.error('用户不存在');
        return;
      }
      
      // 检查用户是否已在其他团队
      const existingMembership = teams.memberships?.find(m => m.userId === user.id);
      if (existingMembership) {
        ElMessage.error('该用户已加入其他团队');
        return;
      }
      
      // 创建新的成员关系
      const newMembership = {
        id: `mem-${Date.now()}`,
        teamId: userTeam.value.id,
        userId: user.id,
        role: 'member',
        createdAt: new Date().toISOString()
      };
      
      // 更新本地存储
      teams.memberships = [...(teams.memberships || []), newMembership];
      localStorage.setItem('teams', JSON.stringify(teams));
      
      // 更新成员列表
      teamMembers.value.push({
        id: newMembership.id,
        userId: user.id,
        username: user.username,
        email: user.email,
        role: 'member',
        createdAt: newMembership.createdAt
      });
      
      // 从可选用户列表中移除
      registeredUsers.value = registeredUsers.value.filter(u => u.username !== user.username);
      
      ElMessage.success(t('team.addMemberSuccess'));
      addMemberDialogVisible.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error(t('team.addMemberFailed'));
  }
};

// 移除团队成员
const removeTeamMember = async (memberId, userId) => {
  try {
    await ElMessageBox.confirm(
      t('team.removeMember') + '?',
      t('common.confirm'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    
    // 这里应该调用实际的API
    // await api.removeTeamMember(userTeam.value.id, userId);
    
    // 模拟移除成功
    setTimeout(() => {
      if (!userTeam.value) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      // 获取本地存储
      const localTeams = localStorage.getItem('teams');
      const localUsers = localStorage.getItem('users');
      
      if (!localTeams || !localUsers) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      const teams = JSON.parse(localTeams);
      const users = JSON.parse(localUsers);
      
      // 移除成员关系
      teams.memberships = teams.memberships?.filter(m => m.id !== memberId) || [];
      localStorage.setItem('teams', JSON.stringify(teams));
      
      // 更新成员列表
      teamMembers.value = teamMembers.value.filter(member => member.id !== memberId);
      
      // 将用户添加回可选用户列表
      const user = users.list?.find(u => u.id === userId);
      if (user) {
        registeredUsers.value.push({
          id: user.id,
          username: user.username,
          email: user.email
        });
      }
      
      ElMessage.success(t('team.removeMemberSuccess'));
    }, 500);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('team.removeMemberFailed'));
    }
  }
};

// 更新成员角色
const updateMemberRole = async (memberId, userId, role) => {
  try {
    // 这里应该调用实际的API
    // await api.updateTeamMemberRole(userTeam.value.id, userId, { role });
    
    // 模拟更新成功
    setTimeout(() => {
      if (!userTeam.value) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      // 获取本地存储
      const localTeams = localStorage.getItem('teams');
      if (!localTeams) {
        ElMessage.error(t('common.error'));
        return;
      }
      
      const teams = JSON.parse(localTeams);
      
      // 更新成员角色
      const membershipIndex = teams.memberships?.findIndex(m => m.id === memberId);
      if (membershipIndex !== -1 && membershipIndex !== undefined) {
        teams.memberships[membershipIndex].role = role === 'admin' ? 'member' : 'admin';
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // 更新本地成员列表
        const memberIndex = teamMembers.value.findIndex(member => member.id === memberId);
        if (memberIndex !== -1) {
          teamMembers.value[memberIndex].role = teams.memberships[membershipIndex].role;
        }
        
        ElMessage.success(t('team.updateRoleSuccess'));
      } else {
        ElMessage.error(t('common.error'));
      }
    }, 500);
  } catch (error) {
    ElMessage.error(t('team.updateRoleFailed'));
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadUserTeam();
});
</script>

<template>
  <div class="team-management-container">
    <div class="page-header">
      <h1>{{ t('team.management') }}</h1>
    </div>
    
    <el-card v-loading="loading" shadow="never" class="team-card">
      <!-- 用户尚未创建或加入团队 -->
      <div v-if="!userTeam" class="no-team-container">
        <el-empty :description="t('team.noTeam')">
          <template #extra>
            <el-button type="primary" @click="openCreateDialog">
              {{ t('team.create') }}
            </el-button>
          </template>
        </el-empty>
      </div>
      
      <!-- 用户已有团队 -->
      <div v-else class="team-info-container">
        <div class="team-header">
          <div class="team-title">
            <h2>{{ userTeam.name }}</h2>
            <el-tag :type="isTeamOwner ? 'danger' : 'warning'">
              {{ isTeamOwner ? t('team.ownerRole') : t('team.memberRole') }}
            </el-tag>
          </div>
          
          <div class="team-actions" v-if="isTeamAdmin">
            <el-button type="primary" @click="openMemberDialog">
              {{ t('team.members') }}
            </el-button>
            <el-button type="primary" @click="openEditDialog">
              {{ t('common.edit') }}
            </el-button>
            <el-button v-if="isTeamOwner" type="danger" @click="deleteTeam">
              {{ t('common.delete') }}
            </el-button>
          </div>
        </div>
        
        <div class="team-description">
          <h3>{{ t('team.description') }}</h3>
          <p>{{ userTeam.description }}</p>
        </div>
        
        <div class="team-details">
          <div class="detail-item">
            <span class="label">{{ t('team.owner') }}:</span>
            <span>{{ userTeam.ownerName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('team.createTime') }}:</span>
            <span>{{ new Date(userTeam.createdAt).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 创建团队对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="t('team.create')"
      width="600px"
    >
      <el-form :model="currentTeam" label-width="100px" :rules="rules">
        <el-form-item :label="t('team.name')" prop="name">
          <el-input v-model="currentTeam.name" />
        </el-form-item>
        
        <el-form-item :label="t('team.description')" prop="description">
          <el-input v-model="currentTeam.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="createTeam">
          {{ t('common.create') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑团队对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('team.edit')"
      width="600px"
    >
      <el-form :model="currentTeam" label-width="100px" :rules="rules">
        <el-form-item :label="t('team.name')" prop="name">
          <el-input v-model="currentTeam.name" />
        </el-form-item>
        
        <el-form-item :label="t('team.description')" prop="description">
          <el-input v-model="currentTeam.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateTeam">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 团队成员管理对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      :title="t('team.members')"
      width="800px"
    >
      <div class="member-header">
        <h3>{{ t('team.members') }}</h3>
        <el-button v-if="isTeamAdmin" type="primary" @click="openAddMemberDialog">
          <el-icon><Plus /></el-icon>
          {{ t('team.addMember') }}
        </el-button>
      </div>
      
      <el-table
        :data="teamMembers"
        border
        style="width: 100%"
      >
        <el-table-column prop="username" :label="t('user.username')" min-width="120" />
        <el-table-column prop="email" :label="t('user.email')" min-width="180" />
        <el-table-column prop="role" :label="t('team.memberRole')" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.role === 'owner' ? 'danger' : row.role === 'admin' ? 'warning' : 'info'"
            >
              {{ row.role === 'owner' ? t('team.ownerRole') : row.role === 'admin' ? t('team.adminRole') : t('team.memberRole') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('team.joinTime')" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column v-if="isTeamOwner" :label="t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'owner'"
              size="small"
              type="primary"
              @click="updateMemberRole(row.id, row.userId, row.role)"
            >
              {{ row.role === 'admin' ? t('team.setMember') : t('team.setAdmin') }}
            </el-button>
            <el-button
              v-if="row.role !== 'owner'"
              size="small"
              type="danger"
              @click="removeTeamMember(row.id, row.userId)"
            >
              {{ t('team.removeMember') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="memberDialogVisible = false">
          {{ t('common.close') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 添加成员对话框 -->
    <el-dialog
      v-model="addMemberDialogVisible"
      :title="t('team.addMember')"
      width="500px"
    >
      <el-form :model="newMember" label-width="100px" :rules="rules">
        <el-form-item :label="t('user.username')" prop="username">
          <el-select v-model="newMember.username" filterable style="width: 100%">
            <el-option
              v-for="user in registeredUsers"
              :key="user.id"
              :label="user.username"
              :value="user.username"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="addMemberDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="addTeamMember">
          {{ t('common.add') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.team-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.team-card {
  margin-bottom: 20px;
}

.no-team-container {
  padding: 40px 0;
  text-align: center;
}

.team-info-container {
  padding: 20px;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.team-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.team-actions {
  display: flex;
  gap: 10px;
}

.team-description {
  margin-bottom: 20px;
}

.team-description h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.team-description p {
  margin: 0;
  color: #606266;
}

.team-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
}

.detail-item .label {
  font-weight: 500;
  color: #606266;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.member-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}
</style>
