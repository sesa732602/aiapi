/**
 * 创建订单页面组件
 */
<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { useRouter } from 'vue-router';

// 国际化
const { t } = useI18n();
const elementLocale = inject('elementLocale');

// 模拟路由
const router = {
  push: (path: string) => {
    window.location.href = path;
  }
};

// API列表
const apiList = ref([]);

// 选中的API
const selectedApi = ref(null);

// 套餐列表
const planList = ref([]);

// 选中的套餐
const selectedPlan = ref(null);

// 加载状态
const loading = ref({
  apis: false,
  plans: false,
  submit: false
});

// API基础URL
const API_BASE_URL = '/api';

// 获取Token
const getToken = () => {
  return localStorage.getItem('token');
};

// API请求配置
const getRequestConfig = () => {
  return {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  };
};

// 加载API列表
const loadApiList = async () => {
  loading.value.apis = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/apis`,
      getRequestConfig()
    );
    
    if (response.data.success) {
      apiList.value = response.data.data.apis || [];
    } else {
      ElMessage.error(response.data.message || t('common.error'));
    }
  } catch (error) {
    console.error('加载API列表失败:', error);
    ElMessage.error(t('common.error'));
  } finally {
    loading.value.apis = false;
  }
};

// 加载套餐列表
const loadPlanList = async (apiId) => {
  if (!apiId) {
    planList.value = [];
    selectedPlan.value = null;
    return;
  }
  
  loading.value.plans = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/apis/${apiId}/plans`,
      getRequestConfig()
    );
    
    if (response.data.success) {
      planList.value = response.data.data.plans || [];
      selectedPlan.value = null;
    } else {
      ElMessage.error(response.data.message || t('common.error'));
    }
  } catch (error) {
    console.error('加载套餐列表失败:', error);
    ElMessage.error(t('common.error'));
  } finally {
    loading.value.plans = false;
  }
};

// 处理API选择变化
const handleApiChange = (apiId) => {
  loadPlanList(apiId);
};

// 创建订单
const createOrder = async () => {
  if (!selectedApi.value) {
    ElMessage.warning(t('order.selectApi'));
    return;
  }
  
  if (!selectedPlan.value) {
    ElMessage.warning(t('order.selectPlan'));
    return;
  }
  
  loading.value.submit = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/orders`,
      {
        apiId: selectedApi.value,
        planId: selectedPlan.value
      },
      getRequestConfig()
    );
    
    if (response.data.success) {
      ElMessage.success(t('order.createSuccess'));
      // 跳转到订单管理页面
      router.push('/order');
    } else {
      ElMessage.error(response.data.message || t('order.createFailed'));
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    ElMessage.error(t('order.createFailed'));
  } finally {
    loading.value.submit = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadApiList();
});
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <div class="create-order-container">
      <div class="page-header">
        <h1>{{ t('order.createOrder') }}</h1>
      </div>
      
      <el-card shadow="never" class="create-order-card">
        <el-form label-position="top">
          <el-form-item :label="t('order.selectApi')">
            <el-select
              v-model="selectedApi"
              :placeholder="t('order.selectApi')"
              style="width: 100%"
              :loading="loading.apis"
              @change="handleApiChange"
            >
              <el-option
                v-for="api in apiList"
                :key="api.id"
                :label="api.name"
                :value="api.id"
              >
                <div class="api-option">
                  <div class="api-name">{{ api.name }}</div>
                  <div class="api-description">{{ api.description }}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item :label="t('order.selectPlan')">
            <el-select
              v-model="selectedPlan"
              :placeholder="t('order.selectPlan')"
              style="width: 100%"
              :loading="loading.plans"
              :disabled="!selectedApi"
            >
              <el-option
                v-for="plan in planList"
                :key="plan.id"
                :label="plan.name"
                :value="plan.id"
              >
                <div class="plan-option">
                  <div class="plan-name">{{ plan.name }}</div>
                  <div class="plan-price">¥{{ Number(plan.price).toFixed(2) }}</div>
                  <div class="plan-details">
                    {{ t('order.callLimit') }}: {{ plan.callLimit }} | 
                    {{ t('order.concurrencyLimit') }}: {{ plan.concurrencyLimit }} | 
                    {{ t('order.validityDays') }}: {{ plan.validityDays }} {{ t('order.days') }}
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading.submit"
              @click="createOrder"
              style="width: 100%"
            >
              {{ t('order.confirmOrder') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-config-provider>
</template>

<style scoped>
.create-order-container {
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

.create-order-card {
  max-width: 600px;
  margin: 0 auto;
}

.api-option, .plan-option {
  padding: 5px 0;
}

.api-name, .plan-name {
  font-weight: 500;
}

.api-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.plan-price {
  font-weight: 500;
  color: #f56c6c;
  margin-top: 5px;
}

.plan-details {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
