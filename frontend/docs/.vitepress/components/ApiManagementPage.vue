/**
 * API管理页面组件
 */
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';

// 国际化
const { t } = useI18n();

// API列表
const apiList = ref([]);

// 加载状态
const loading = ref(true);

// 搜索关键词
const searchKeyword = ref('');

// 当前选中的团队ID
const selectedTeamId = ref('');

// 团队列表
const teamList = ref([]);

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 对话框控制
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);

// 当前编辑的API
const currentApi = ref({
  id: '',
  name: '',
  description: '',
  path: '',
  method: 'GET',
  teamId: '',
  isPublic: false
});

// HTTP方法选项
const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' }
];

// 表单规则
const rules = {
  name: [
    { required: true, message: t('api.name') + t('common.required'), trigger: 'blur' },
    { min: 2, max: 50, message: t('api.name') + ' 长度应为 2-50 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: t('api.path') + t('common.required'), trigger: 'blur' },
    { pattern: /^\//, message: '路径应以 / 开头', trigger: 'blur' }
  ],
  teamId: [
    { required: true, message: t('api.team') + t('common.required'), trigger: 'change' }
  ]
};

// 加载API列表
const loadApiList = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const response = await api.getApis({
    //   teamId: selectedTeamId.value || undefined,
    //   page: pagination.value.currentPage,
    //   pageSize: pagination.value.pageSize,
    //   keyword: searchKeyword.value
    // });
    
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          name: '用户认证API',
          description: '提供用户登录、注册、认证等功能',
          path: '/api/auth',
          method: 'POST',
          teamId: '1',
          teamName: '开发团队',
          creatorId: '1',
          creatorName: 'Admin',
          isPublic: true,
          createdAt: '2025-05-20T10:30:00Z',
          updatedAt: '2025-05-21T15:45:00Z'
        },
        {
          id: '2',
          name: '产品API',
          description: '提供产品查询、创建、更新等功能',
          path: '/api/products',
          method: 'GET',
          teamId: '1',
          teamName: '开发团队',
          creatorId: '1',
          creatorName: 'Admin',
          isPublic: false,
          createdAt: '2025-05-19T09:15:00Z',
          updatedAt: '2025-05-20T11:20:00Z'
        },
        {
          id: '3',
          name: '订单API',
          description: '提供订单创建、查询、支付等功能',
          path: '/api/orders',
          method: 'GET',
          teamId: '2',
          teamName: '业务团队',
          creatorId: '2',
          creatorName: 'Manager',
          isPublic: false,
          createdAt: '2025-05-18T14:25:00Z',
          updatedAt: '2025-05-19T16:30:00Z'
        }
      ];
      
      apiList.value = mockData;
      pagination.value.total = mockData.length;
      loading.value = false;
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 加载团队列表
const loadTeamList = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getTeams();
    
    // 模拟数据
    setTimeout(() => {
      teamList.value = [
        { id: '1', name: '开发团队' },
        { id: '2', name: '业务团队' },
        { id: '3', name: '测试团队' }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  loadApiList();
};

// 处理团队筛选
const handleTeamChange = () => {
  pagination.value.currentPage = 1;
  loadApiList();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  loadApiList();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  loadApiList();
};

// 打开创建API对话框
const openCreateDialog = () => {
  currentApi.value = {
    id: '',
    name: '',
    description: '',
    path: '',
    method: 'GET',
    teamId: '',
    isPublic: false
  };
  createDialogVisible.value = true;
};

// 打开编辑API对话框
const openEditDialog = (api) => {
  currentApi.value = { ...api };
  editDialogVisible.value = true;
};

// 创建API
const createApi = async () => {
  try {
    // 这里应该调用实际的API
    // await api.createApi(currentApi.value);
    
    // 模拟创建成功
    setTimeout(() => {
      ElMessage.success(t('api.createSuccess'));
      createDialogVisible.value = false;
      loadApiList();
    }, 500);
  } catch (error) {
    ElMessage.error(t('api.createFailed'));
  }
};

// 更新API
const updateApi = async () => {
  try {
    // 这里应该调用实际的API
    // await api.updateApi(currentApi.value.id, currentApi.value);
    
    // 模拟更新成功
    setTimeout(() => {
      ElMessage.success(t('api.updateSuccess'));
      editDialogVisible.value = false;
      loadApiList();
    }, 500);
  } catch (error) {
    ElMessage.error(t('api.updateFailed'));
  }
};

// 删除API
const deleteApi = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      t('api.deleteConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    
    // 这里应该调用实际的API
    // await api.deleteApi(id);
    
    // 模拟删除成功
    setTimeout(() => {
      ElMessage.success(t('api.deleteSuccess'));
      loadApiList();
    }, 500);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('api.deleteFailed'));
    }
  }
};

// 查看API详情
const viewApiDetail = (id: string) => {
  // 跳转到API详情页面
  window.location.href = `/api/${id}`;
};

// 组件挂载时加载数据
onMounted(() => {
  loadApiList();
  loadTeamList();
});
</script>

<template>
  <div class="api-management-container">
    <div class="page-header">
      <h1>{{ t('api.management') }}</h1>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        {{ t('api.create') }}
      </el-button>
    </div>
    
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('common.search')"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        
        <el-select
          v-model="selectedTeamId"
          :placeholder="t('api.team')"
          clearable
          class="team-select"
          @change="handleTeamChange"
        >
          <el-option
            v-for="team in teamList"
            :key="team.id"
            :label="team.name"
            :value="team.id"
          />
        </el-select>
      </div>
    </el-card>
    
    <el-card shadow="never" class="api-list-card">
      <el-table
        v-loading="loading"
        :data="apiList"
        border
        style="width: 100%"
      >
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
        <el-table-column prop="isPublic" :label="t('api.isPublic')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic ? 'success' : 'info'">
              {{ row.isPublic ? t('common.yes') : t('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewApiDetail(row.id)">
              {{ t('api.detail') }}
            </el-button>
            <el-button size="small" type="primary" @click="openEditDialog(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteApi(row.id)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 创建API对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="t('api.create')"
      width="600px"
    >
      <el-form :model="currentApi" label-width="100px" :rules="rules">
        <el-form-item :label="t('api.name')" prop="name">
          <el-input v-model="currentApi.name" />
        </el-form-item>
        
        <el-form-item :label="t('api.description')" prop="description">
          <el-input v-model="currentApi.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item :label="t('api.path')" prop="path">
          <el-input v-model="currentApi.path" />
        </el-form-item>
        
        <el-form-item :label="t('api.method')" prop="method">
          <el-select v-model="currentApi.method" style="width: 100%">
            <el-option
              v-for="option in methodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('api.team')" prop="teamId">
          <el-select v-model="currentApi.teamId" style="width: 100%">
            <el-option
              v-for="team in teamList"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('api.isPublic')">
          <el-switch v-model="currentApi.isPublic" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="createApi">
          {{ t('common.create') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑API对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('api.edit')"
      width="600px"
    >
      <el-form :model="currentApi" label-width="100px" :rules="rules">
        <el-form-item :label="t('api.name')" prop="name">
          <el-input v-model="currentApi.name" />
        </el-form-item>
        
        <el-form-item :label="t('api.description')" prop="description">
          <el-input v-model="currentApi.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item :label="t('api.path')" prop="path">
          <el-input v-model="currentApi.path" />
        </el-form-item>
        
        <el-form-item :label="t('api.method')" prop="method">
          <el-select v-model="currentApi.method" style="width: 100%">
            <el-option
              v-for="option in methodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('api.team')" prop="teamId">
          <el-select v-model="currentApi.teamId" style="width: 100%">
            <el-option
              v-for="team in teamList"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('api.isPublic')">
          <el-switch v-model="currentApi.isPublic" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateApi">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.api-management-container {
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

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.team-select {
  width: 200px;
}

.api-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input,
  .team-select {
    width: 100%;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
