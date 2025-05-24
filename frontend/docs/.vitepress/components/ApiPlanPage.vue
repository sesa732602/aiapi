/**
 * 套餐管理页面组件
 */
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute } from 'vue-router';

// 国际化
const { t } = useI18n();
const route = useRoute();

// API ID
const apiId = ref('');

// API信息
const apiInfo = ref({
  name: '',
  description: '',
  path: '',
  method: '',
  teamName: ''
});

// 套餐列表
const planList = ref([]);

// 加载状态
const loading = ref(true);

// 对话框控制
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);

// 当前编辑的套餐
const currentPlan = ref({
  id: '',
  name: '',
  description: '',
  price: 0,
  callLimit: 1000,
  concurrencyLimit: 5,
  durationDays: 30
});

// 表单规则
const rules = {
  name: [
    { required: true, message: t('api.planName') + t('common.required'), trigger: 'blur' },
    { min: 2, max: 50, message: t('api.planName') + ' 长度应为 2-50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('api.planDescription') + t('common.required'), trigger: 'blur' }
  ],
  price: [
    { required: true, message: t('api.price') + t('common.required'), trigger: 'blur' },
    { type: 'number', min: 0, message: t('api.price') + ' 必须大于等于 0', trigger: 'blur' }
  ],
  callLimit: [
    { required: true, message: t('api.callLimit') + t('common.required'), trigger: 'blur' },
    { type: 'number', min: 1, message: t('api.callLimit') + ' 必须大于等于 1', trigger: 'blur' }
  ],
  concurrencyLimit: [
    { required: true, message: t('api.concurrencyLimit') + t('common.required'), trigger: 'blur' },
    { type: 'number', min: 1, message: t('api.concurrencyLimit') + ' 必须大于等于 1', trigger: 'blur' }
  ],
  durationDays: [
    { required: true, message: t('api.durationDays') + t('common.required'), trigger: 'blur' },
    { type: 'number', min: 1, message: t('api.durationDays') + ' 必须大于等于 1', trigger: 'blur' }
  ]
};

// 加载API信息
const loadApiInfo = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getApiById(apiId.value);
    
    // 模拟数据
    setTimeout(() => {
      apiInfo.value = {
        name: '用户认证API',
        description: '提供用户登录、注册、认证等功能',
        path: '/api/auth',
        method: 'POST',
        teamName: '开发团队'
      };
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 加载套餐列表
const loadPlanList = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const response = await api.getApiPlans(apiId.value);
    
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          name: '基础套餐',
          description: '适合个人开发者使用',
          price: 99,
          callLimit: 10000,
          concurrencyLimit: 5,
          durationDays: 30,
          createdAt: '2025-05-20T10:30:00Z',
          updatedAt: '2025-05-21T15:45:00Z'
        },
        {
          id: '2',
          name: '专业套餐',
          description: '适合中小型企业使用',
          price: 299,
          callLimit: 50000,
          concurrencyLimit: 20,
          durationDays: 30,
          createdAt: '2025-05-19T09:15:00Z',
          updatedAt: '2025-05-20T11:20:00Z'
        },
        {
          id: '3',
          name: '企业套餐',
          description: '适合大型企业使用',
          price: 999,
          callLimit: 200000,
          concurrencyLimit: 50,
          durationDays: 30,
          createdAt: '2025-05-18T14:25:00Z',
          updatedAt: '2025-05-19T16:30:00Z'
        }
      ];
      
      planList.value = mockData;
      loading.value = false;
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 打开创建套餐对话框
const openCreateDialog = () => {
  currentPlan.value = {
    id: '',
    name: '',
    description: '',
    price: 0,
    callLimit: 1000,
    concurrencyLimit: 5,
    durationDays: 30
  };
  createDialogVisible.value = true;
};

// 打开编辑套餐对话框
const openEditDialog = (plan) => {
  currentPlan.value = { ...plan };
  editDialogVisible.value = true;
};

// 创建套餐
const createPlan = async () => {
  try {
    // 这里应该调用实际的API
    // await api.createApiPlan(apiId.value, currentPlan.value);
    
    // 模拟创建成功
    setTimeout(() => {
      ElMessage.success(t('api.createSuccess'));
      createDialogVisible.value = false;
      loadPlanList();
    }, 500);
  } catch (error) {
    ElMessage.error(t('api.createFailed'));
  }
};

// 更新套餐
const updatePlan = async () => {
  try {
    // 这里应该调用实际的API
    // await api.updateApiPlan(apiId.value, currentPlan.value.id, currentPlan.value);
    
    // 模拟更新成功
    setTimeout(() => {
      ElMessage.success(t('api.updateSuccess'));
      editDialogVisible.value = false;
      loadPlanList();
    }, 500);
  } catch (error) {
    ElMessage.error(t('api.updateFailed'));
  }
};

// 删除套餐
const deletePlan = async (id: string) => {
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
    // await api.deleteApiPlan(apiId.value, id);
    
    // 模拟删除成功
    setTimeout(() => {
      ElMessage.success(t('api.deleteSuccess'));
      loadPlanList();
    }, 500);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('api.deleteFailed'));
    }
  }
};

// 购买套餐
const buyPlan = (plan) => {
  // 跳转到创建订单页面
  window.location.href = `/order/create?planId=${plan.id}`;
};

// 组件挂载时加载数据
onMounted(() => {
  // 从路由获取API ID
  apiId.value = route.params.id as string || '1'; // 默认值用于演示
  
  loadApiInfo();
  loadPlanList();
});
</script>

<template>
  <div class="plan-management-container">
    <div class="page-header">
      <div class="header-left">
        <el-button icon="Back" @click="$router.back()">{{ t('common.back') }}</el-button>
        <h1>{{ apiInfo.name }} - {{ t('api.plans') }}</h1>
      </div>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        {{ t('api.createPlan') }}
      </el-button>
    </div>
    
    <el-card shadow="never" class="api-info-card">
      <div class="api-info">
        <div class="info-item">
          <span class="label">{{ t('api.name') }}:</span>
          <span class="value">{{ apiInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('api.path') }}:</span>
          <span class="value">{{ apiInfo.path }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('api.method') }}:</span>
          <span class="value">
            <el-tag
              :type="apiInfo.method === 'GET' ? 'success' : apiInfo.method === 'POST' ? 'primary' : apiInfo.method === 'PUT' ? 'warning' : apiInfo.method === 'DELETE' ? 'danger' : 'info'"
            >
              {{ apiInfo.method }}
            </el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('api.team') }}:</span>
          <span class="value">{{ apiInfo.teamName }}</span>
        </div>
      </div>
      <div class="api-description">
        <span class="label">{{ t('api.description') }}:</span>
        <p>{{ apiInfo.description }}</p>
      </div>
    </el-card>
    
    <el-card shadow="never" class="plan-list-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('api.plans') }}</span>
        </div>
      </template>
      
      <div v-loading="loading">
        <div v-if="planList.length === 0 && !loading" class="empty-plans">
          <el-empty :description="t('api.noPlans')">
            <el-button type="primary" @click="openCreateDialog">{{ t('api.createPlan') }}</el-button>
          </el-empty>
        </div>
        
        <div v-else class="plan-grid">
          <el-card
            v-for="plan in planList"
            :key="plan.id"
            shadow="hover"
            class="plan-card"
          >
            <template #header>
              <div class="plan-header">
                <h3>{{ plan.name }}</h3>
                <div class="plan-price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ plan.price }}</span>
                  <span class="period">/ {{ plan.durationDays }} {{ t('api.days') }}</span>
                </div>
              </div>
            </template>
            
            <div class="plan-content">
              <p class="plan-description">{{ plan.description }}</p>
              
              <ul class="plan-features">
                <li>
                  <el-icon><Connection /></el-icon>
                  {{ t('api.callLimit') }}: {{ plan.callLimit.toLocaleString() }}
                </li>
                <li>
                  <el-icon><Share /></el-icon>
                  {{ t('api.concurrencyLimit') }}: {{ plan.concurrencyLimit }}
                </li>
                <li>
                  <el-icon><Calendar /></el-icon>
                  {{ t('api.durationDays') }}: {{ plan.durationDays }} {{ t('api.days') }}
                </li>
              </ul>
              
              <div class="plan-actions">
                <el-button type="primary" @click="buyPlan(plan)">
                  {{ t('api.buyPlan') }}
                </el-button>
                <div class="admin-actions">
                  <el-button size="small" type="primary" @click="openEditDialog(plan)">
                    {{ t('common.edit') }}
                  </el-button>
                  <el-button size="small" type="danger" @click="deletePlan(plan.id)">
                    {{ t('common.delete') }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
    
    <!-- 创建套餐对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="t('api.createPlan')"
      width="600px"
    >
      <el-form :model="currentPlan" label-width="140px" :rules="rules">
        <el-form-item :label="t('api.planName')" prop="name">
          <el-input v-model="currentPlan.name" />
        </el-form-item>
        
        <el-form-item :label="t('api.planDescription')" prop="description">
          <el-input v-model="currentPlan.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item :label="t('api.price')" prop="price">
          <el-input-number v-model="currentPlan.price" :min="0" :precision="2" :step="10" />
        </el-form-item>
        
        <el-form-item :label="t('api.callLimit')" prop="callLimit">
          <el-input-number v-model="currentPlan.callLimit" :min="1" :step="1000" />
        </el-form-item>
        
        <el-form-item :label="t('api.concurrencyLimit')" prop="concurrencyLimit">
          <el-input-number v-model="currentPlan.concurrencyLimit" :min="1" :step="1" />
        </el-form-item>
        
        <el-form-item :label="t('api.durationDays')" prop="durationDays">
          <el-input-number v-model="currentPlan.durationDays" :min="1" :step="1" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="createPlan">
          {{ t('common.create') }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑套餐对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('api.edit')"
      width="600px"
    >
      <el-form :model="currentPlan" label-width="140px" :rules="rules">
        <el-form-item :label="t('api.planName')" prop="name">
          <el-input v-model="currentPlan.name" />
        </el-form-item>
        
        <el-form-item :label="t('api.planDescription')" prop="description">
          <el-input v-model="currentPlan.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item :label="t('api.price')" prop="price">
          <el-input-number v-model="currentPlan.price" :min="0" :precision="2" :step="10" />
        </el-form-item>
        
        <el-form-item :label="t('api.callLimit')" prop="callLimit">
          <el-input-number v-model="currentPlan.callLimit" :min="1" :step="1000" />
        </el-form-item>
        
        <el-form-item :label="t('api.concurrencyLimit')" prop="concurrencyLimit">
          <el-input-number v-model="currentPlan.concurrencyLimit" :min="1" :step="1" />
        </el-form-item>
        
        <el-form-item :label="t('api.durationDays')" prop="durationDays">
          <el-input-number v-model="currentPlan.durationDays" :min="1" :step="1" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="updatePlan">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.plan-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.api-info-card {
  margin-bottom: 20px;
}

.api-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  margin-right: 8px;
  color: #606266;
}

.api-description p {
  margin-top: 5px;
  margin-bottom: 0;
}

.plan-list-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.empty-plans {
  padding: 40px 0;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.plan-card {
  height: 100%;
}

.plan-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plan-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.plan-price {
  margin-top: 10px;
  text-align: center;
}

.currency {
  font-size: 16px;
  vertical-align: super;
}

.amount {
  font-size: 32px;
  font-weight: 600;
  color: #409EFF;
}

.period {
  font-size: 14px;
  color: #909399;
}

.plan-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plan-description {
  margin-top: 0;
  color: #606266;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 15px 0;
  flex-grow: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.plan-features li .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.plan-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-actions {
  display: flex;
  justify-content: space-between;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .api-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .plan-grid {
    grid-template-columns: 1fr;
  }
}
</style>
