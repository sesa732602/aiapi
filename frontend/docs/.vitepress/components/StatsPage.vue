/**
 * 统计分析页面组件
 */
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

// 国际化
const { t } = useI18n();

// 加载状态
const loading = ref(true);

// 统计数据
const statsData = ref({
  totalCalls: 0,
  avgResponseTime: 0,
  callsByStatus: {},
  callsByDate: {},
  callsByApi: {}
});

// 用户额度
const userQuotas = ref([]);

// 时间范围
const timeRange = ref('7');

// 图表实例
let callsByDateChart = null;
let callsByStatusChart = null;
let callsByApiChart = null;

// 充值对话框
const rechargeDialogVisible = ref(false);
const rechargeForm = ref({
  userId: '',
  apiId: '',
  callsToAdd: 1000,
  daysToExtend: 30
});

// 用户列表（仅超级管理员可见）
const userList = ref([]);

// API列表
const apiList = ref([]);

// 计算属性：是否为超级管理员
const isSuperAdmin = computed(() => {
  // 这里应该从用户状态或存储中获取
  return true; // 模拟超级管理员
});

// 初始化图表
const initCharts = () => {
  // 初始化按日期调用图表
  const dateChartDom = document.getElementById('callsByDateChart');
  if (dateChartDom) {
    callsByDateChart = echarts.init(dateChartDom);
    
    const dates = Object.keys(statsData.value.callsByDate).sort();
    const callData = dates.map(date => statsData.value.callsByDate[date]);
    
    const dateOption = {
      title: {
        text: t('stats.callsByDate')
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: t('stats.apiCalls'),
          data: callData,
          type: 'line',
          smooth: true,
          areaStyle: {}
        }
      ]
    };
    
    callsByDateChart.setOption(dateOption);
  }
  
  // 初始化按状态码调用图表
  const statusChartDom = document.getElementById('callsByStatusChart');
  if (statusChartDom) {
    callsByStatusChart = echarts.init(statusChartDom);
    
    const statusCodes = Object.keys(statsData.value.callsByStatus);
    const statusData = statusCodes.map(code => ({
      name: code,
      value: statsData.value.callsByStatus[code]
    }));
    
    const statusOption = {
      title: {
        text: t('stats.callsByStatus')
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: statusCodes
      },
      series: [
        {
          name: t('stats.apiCalls'),
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: statusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    
    callsByStatusChart.setOption(statusOption);
  }
  
  // 初始化按API调用图表
  const apiChartDom = document.getElementById('callsByApiChart');
  if (apiChartDom) {
    callsByApiChart = echarts.init(apiChartDom);
    
    const apis = Object.keys(statsData.value.callsByApi);
    const apiData = apis.map(api => ({
      name: statsData.value.callsByApi[api].apiName,
      value: statsData.value.callsByApi[api].count
    }));
    
    const apiOption = {
      title: {
        text: t('stats.callsByApi')
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: apis.map(api => statsData.value.callsByApi[api].apiName)
      },
      series: [
        {
          name: t('stats.apiCalls'),
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: apiData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    
    callsByApiChart.setOption(apiOption);
  }
};

// 更新图表时间范围
const updateTimeRange = (days) => {
  timeRange.value = days;
  loadStatsData();
};

// 加载统计数据
const loadStatsData = async () => {
  loading.value = true;
  
  try {
    // 这里应该调用实际的API
    // const response = await api.getUserCallStats({ days: timeRange.value });
    
    // 模拟数据
    setTimeout(() => {
      // 生成过去n天的日期
      const dates = {};
      const today = new Date();
      const daysCount = parseInt(timeRange.value);
      
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates[dateStr] = Math.floor(Math.random() * 100) + 10;
      }
      
      statsData.value = {
        totalCalls: 1250,
        avgResponseTime: 120,
        callsByStatus: {
          '200': 1050,
          '400': 120,
          '401': 50,
          '404': 20,
          '500': 10
        },
        callsByDate: dates,
        callsByApi: {
          '1': { apiName: '用户认证API', count: 500 },
          '2': { apiName: '产品API', count: 350 },
          '3': { apiName: '订单API', count: 400 }
        }
      };
      
      loading.value = false;
      
      // 初始化图表
      setTimeout(() => {
        initCharts();
      }, 100);
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 加载用户额度
const loadUserQuotas = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getUserQuotas();
    
    // 模拟数据
    setTimeout(() => {
      userQuotas.value = [
        {
          id: '1',
          apiId: '1',
          apiName: '用户认证API',
          callsRemaining: 8500,
          concurrencyLimit: 5,
          expiresAt: '2025-06-20T00:00:00Z'
        },
        {
          id: '2',
          apiId: '2',
          apiName: '产品API',
          callsRemaining: 45000,
          concurrencyLimit: 20,
          expiresAt: '2025-06-19T00:00:00Z'
        },
        {
          id: '3',
          apiId: '3',
          apiName: '订单API',
          callsRemaining: 190000,
          concurrencyLimit: 50,
          expiresAt: '2025-06-18T00:00:00Z'
        }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 加载用户列表（仅超级管理员）
const loadUserList = async () => {
  if (!isSuperAdmin.value) return;
  
  try {
    // 这里应该调用实际的API
    // const response = await api.getUsers();
    
    // 模拟数据
    setTimeout(() => {
      userList.value = [
        { id: '1', username: 'admin', email: 'admin@example.com' },
        { id: '2', username: 'user1', email: 'user1@example.com' },
        { id: '3', username: 'user2', email: 'user2@example.com' }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 加载API列表
const loadApiList = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await api.getApis();
    
    // 模拟数据
    setTimeout(() => {
      apiList.value = [
        { id: '1', name: '用户认证API' },
        { id: '2', name: '产品API' },
        { id: '3', name: '订单API' }
      ];
    }, 500);
  } catch (error) {
    ElMessage.error(t('common.error'));
  }
};

// 打开充值对话框
const openRechargeDialog = () => {
  rechargeForm.value = {
    userId: '',
    apiId: '',
    callsToAdd: 1000,
    daysToExtend: 30
  };
  rechargeDialogVisible.value = true;
};

// 充值用户额度
const rechargeUserQuota = async () => {
  try {
    // 这里应该调用实际的API
    // await api.rechargeUserQuota(rechargeForm.value);
    
    // 模拟充值成功
    setTimeout(() => {
      ElMessage.success(t('stats.rechargeSuccess'));
      rechargeDialogVisible.value = false;
      loadUserQuotas();
    }, 500);
  } catch (error) {
    ElMessage.error(t('stats.rechargeFailed'));
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStatsData();
  loadUserQuotas();
  
  if (isSuperAdmin.value) {
    loadUserList();
  }
  
  loadApiList();
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    if (callsByDateChart) callsByDateChart.resize();
    if (callsByStatusChart) callsByStatusChart.resize();
    if (callsByApiChart) callsByApiChart.resize();
  });
});
</script>

<template>
  <div class="stats-container">
    <div class="page-header">
      <h1>{{ t('stats.analysis') }}</h1>
      <div v-if="isSuperAdmin" class="header-actions">
        <el-button type="primary" @click="openRechargeDialog">
          <el-icon><Plus /></el-icon>
          {{ t('stats.rechargeQuota') }}
        </el-button>
      </div>
    </div>
    
    <el-card shadow="never" class="summary-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('stats.apiCalls') }}</span>
          <div class="time-range-selector">
            <el-radio-group v-model="timeRange" size="small" @change="updateTimeRange">
              <el-radio-button label="7">{{ t('dashboard.last7Days') }}</el-radio-button>
              <el-radio-button label="30">{{ t('dashboard.last30Days') }}</el-radio-button>
              <el-radio-button label="90">{{ t('dashboard.last90Days') }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <div v-loading="loading" class="summary-content">
        <el-row :gutter="20" class="stats-summary">
          <el-col :xs="24" :sm="12">
            <div class="summary-item">
              <div class="summary-label">{{ t('stats.totalCalls') }}</div>
              <div class="summary-value">{{ statsData.totalCalls.toLocaleString() }}</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="summary-item">
              <div class="summary-label">{{ t('stats.avgResponseTime') }}</div>
              <div class="summary-value">{{ statsData.avgResponseTime }} ms</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="24">
        <el-card shadow="never" class="chart-card">
          <div v-loading="loading" id="callsByDateChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="chart-card">
          <div v-loading="loading" id="callsByStatusChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="never" class="chart-card">
          <div v-loading="loading" id="callsByApiChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card shadow="never" class="quota-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('stats.quotas') }}</span>
        </div>
      </template>
      
      <el-table :data="userQuotas" border style="width: 100%">
        <el-table-column prop="apiName" :label="t('stats.apiName')" min-width="150" />
        <el-table-column prop="callsRemaining" :label="t('stats.callsRemaining')" width="150">
          <template #default="{ row }">
            {{ row.callsRemaining.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="concurrencyLimit" :label="t('stats.concurrencyLimit')" width="120" />
        <el-table-column prop="expiresAt" :label="t('stats.expiresAt')" width="180">
          <template #default="{ row }">
            {{ new Date(row.expiresAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 充值对话框（仅超级管理员可见） -->
    <el-dialog
      v-if="isSuperAdmin"
      v-model="rechargeDialogVisible"
      :title="t('stats.rechargeQuota')"
      width="500px"
    >
      <el-form :model="rechargeForm" label-width="140px">
        <el-form-item :label="t('user.username')">
          <el-select v-model="rechargeForm.userId" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('api.name')">
          <el-select v-model="rechargeForm.apiId" style="width: 100%">
            <el-option
              v-for="api in apiList"
              :key="api.id"
              :label="api.name"
              :value="api.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('stats.callsToAdd')">
          <el-input-number v-model="rechargeForm.callsToAdd" :min="1" :step="1000" style="width: 100%" />
        </el-form-item>
        
        <el-form-item :label="t('stats.daysToExtend')">
          <el-input-number v-model="rechargeForm.daysToExtend" :min="1" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="rechargeUserQuota">
          {{ t('stats.recharge') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.stats-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card {
  margin-bottom: 20px;
}

.stats-summary {
  padding: 10px 0;
}

.summary-item {
  text-align: center;
  padding: 10px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
}

.chart-container {
  height: 300px;
}

.quota-card {
  margin-bottom: 20px;
}

.time-range-selector {
  margin-left: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .time-range-selector {
    margin-left: 0;
  }
}
</style>
