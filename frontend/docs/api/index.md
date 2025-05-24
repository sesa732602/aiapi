/**
 * API管理页面
 */
<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

// 检查用户是否已登录
const isLoggedIn = ref(false);
const userInfo = ref(null);

onMounted(() => {
  // 从localStorage获取用户信息
  const user = localStorage.getItem('user');
  if (user) {
    try {
      userInfo.value = JSON.parse(user);
      isLoggedIn.value = true;
    } catch (e) {
      console.error('解析用户信息失败', e);
    }
  }
  
  // 如果未登录，跳转到登录页
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
});

// 模拟API数据
const apis = ref([
  {
    id: 1,
    name: '用户信息API',
    description: '提供用户信息查询和管理功能',
    path: '/api/users',
    method: 'GET',
    createdAt: '2025-01-15',
    callCount: 12500,
    status: 'active'
  },
  {
    id: 2,
    name: '订单管理API',
    description: '提供订单创建、查询和管理功能',
    path: '/api/orders',
    method: 'POST',
    createdAt: '2025-02-20',
    callCount: 8300,
    status: 'active'
  },
  {
    id: 3,
    name: '支付接口',
    description: '提供多种支付方式集成',
    path: '/api/payments',
    method: 'POST',
    createdAt: '2025-03-05',
    callCount: 5600,
    status: 'active'
  },
  {
    id: 4,
    name: '数据分析API',
    description: '提供数据统计和分析功能',
    path: '/api/analytics',
    method: 'GET',
    createdAt: '2025-03-18',
    callCount: 3200,
    status: 'inactive'
  },
  {
    id: 5,
    name: '文件存储API',
    description: '提供文件上传和管理功能',
    path: '/api/files',
    method: 'PUT',
    createdAt: '2025-04-10',
    callCount: 4800,
    status: 'active'
  }
]);

// 创建新API对话框
const dialogVisible = ref(false);
const newApi = ref({
  name: '',
  description: '',
  path: '',
  method: 'GET'
});

// 创建API
const createApi = () => {
  if (!newApi.value.name || !newApi.value.path) {
    ElMessage.error('API名称和路径不能为空');
    return;
  }
  
  // 模拟创建API
  const api = {
    id: apis.value.length + 1,
    ...newApi.value,
    createdAt: new Date().toISOString().split('T')[0],
    callCount: 0,
    status: 'active'
  };
  
  apis.value.push(api);
  dialogVisible.value = false;
  ElMessage.success('API创建成功');
  
  // 重置表单
  newApi.value = {
    name: '',
    description: '',
    path: '',
    method: 'GET'
  };
};
</script>

<template>
  <div v-if="isLoggedIn">
    <div class="page-header">
      <h1>API管理</h1>
      <el-button type="primary" @click="dialogVisible = true">创建API</el-button>
    </div>
    
    <el-card class="api-stats">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <h3>API总数</h3>
            <p class="stat-value">{{ apis.length }}</p>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-item">
            <h3>总调用次数</h3>
            <p class="stat-value">{{ apis.reduce((sum, api) => sum + api.callCount, 0).toLocaleString() }}</p>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-item">
            <h3>活跃API</h3>
            <p class="stat-value">{{ apis.filter(api => api.status === 'active').length }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="api-list">
      <template #header>
        <div class="card-header">
          <span>API列表</span>
          <el-input
            placeholder="搜索API"
            style="width: 300px"
          />
        </div>
      </template>
      
      <el-table :data="apis" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="method" label="方法" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.method === 'GET' ? 'success' : scope.row.method === 'POST' ? 'warning' : 'info'"
            >
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="callCount" label="调用次数" width="120">
          <template #default="scope">
            {{ scope.row.callCount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'active' ? 'success' : 'danger'"
            >
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 创建API对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建新API"
      width="50%"
    >
      <el-form :model="newApi" label-width="100px">
        <el-form-item label="API名称">
          <el-input v-model="newApi.name" placeholder="请输入API名称" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="newApi.description" type="textarea" placeholder="请输入API描述" />
        </el-form-item>
        
        <el-form-item label="路径">
          <el-input v-model="newApi.path" placeholder="请输入API路径，例如：/api/users" />
        </el-form-item>
        
        <el-form-item label="请求方法">
          <el-select v-model="newApi.method" placeholder="请选择请求方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createApi">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <div v-else>
    <p>正在检查登录状态...</p>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.api-stats {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
</style>
