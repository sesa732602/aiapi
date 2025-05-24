/**
 * 仪表盘页面组件
 */
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

// 国际化
const { t } = useI18n();

// 用户信息
const user = ref({
  username: 'Admin',
  role: 'super_admin'
});

// 统计数据
const stats = ref({
  totalApis: 0,
  totalTeams: 0,
  totalCalls: 0
});

// 最近活动
const recentActivities = ref([]);

// 加载状态
const loading = ref(true);

// 图表实例
let apiCallChart: echarts.ECharts | null = null;

// 时间范围
const timeRange = ref('7');

// 计算属性：用户显示名称
const displayName = computed(() => {
  return user.value.username;
});

// 初始化图表
const initChart = () => {
  const chartDom = document.getElementById('apiCallChart');
  if (!chartDom) return;
  
  apiCallChart = echarts.init(chartDom);
  
  // 模拟数据
  const dates = [];
  const callData = [];
  
  // 生成过去7天的日期和随机数据
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    callData.push(Math.floor(Math.random() * 100) + 20);
  }
  
  const option = {
    title: {
      text: t('dashboard.apiCallTrend')
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
        smooth: true
      }
    ]
  };
  
  apiCallChart.setOption(option);
};

// 更新图表时间范围
const updateTimeRange = (days: string) => {
  timeRange.value = days;
  
  // 这里应该调用API获取对应时间范围的数据
  // 暂时使用模拟数据
  if (!apiCallChart) return;
  
  const dates = [];
  const callData = [];
  
  const daysCount = parseInt(days);
  const today = new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    callData.push(Math.floor(Math.random() * 100) + 20);
  }
  
  apiCallChart.setOption({
    xAxis: {
      data: dates
    },
    series: [
      {
        data: callData
      }
    ]
  });
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  
  try {
    // 这里应该调用实际的API
    // 暂时使用模拟数据
    setTimeout(() => {
      stats.value = {
        totalApis: 15,
        totalTeams: 3,
        totalCalls: 1250
      };
      
      recentActivities.value = [
        { id: 1, type: 'api_create', name: 'User API', time: '2025-05-23T10:30:00Z' },
        { id: 2, type: 'team_join', name: 'Development Team', time: '2025-05-22T14:15:00Z' },
        { id: 3, type: 'api_call', name: 'Auth API', time: '2025-05-22T09:45:00Z' }
      ];
      
      loading.value = false;
      
      // 初始化图表
      initChart();
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    if (apiCallChart) {
      apiCallChart.resize();
    }
  });
});
</script>

<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="welcome-section">
          <h1>{{ t('dashboard.welcome', { name: displayName }) }}</h1>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.totalApis') }}</span>
            </div>
          </template>
          <div v-if="loading" class="card-loading">
            <el-skeleton :rows="1" animated />
          </div>
          <div v-else class="card-value">{{ stats.totalApis }}</div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.totalTeams') }}</span>
            </div>
          </template>
          <div v-if="loading" class="card-loading">
            <el-skeleton :rows="1" animated />
          </div>
          <div v-else class="card-value">{{ stats.totalTeams }}</div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.totalCalls') }}</span>
            </div>
          </template>
          <div v-if="loading" class="card-loading">
            <el-skeleton :rows="1" animated />
          </div>
          <div v-else class="card-value">{{ stats.totalCalls }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.apiCallTrend') }}</span>
              <div class="time-range-selector">
                <el-radio-group v-model="timeRange" size="small" @change="updateTimeRange">
                  <el-radio-button label="7">{{ t('dashboard.last7Days') }}</el-radio-button>
                  <el-radio-button label="30">{{ t('dashboard.last30Days') }}</el-radio-button>
                  <el-radio-button label="90">{{ t('dashboard.last90Days') }}</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="8" animated />
          </div>
          <div v-else id="apiCallChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card shadow="hover" class="quick-actions-card">
              <template #header>
                <div class="card-header">
                  <span>{{ t('dashboard.quickActions') }}</span>
                </div>
              </template>
              <div class="quick-actions">
                <el-button type="primary" icon="Plus">{{ t('dashboard.createApi') }}</el-button>
                <el-button type="success" icon="UserFilled">{{ t('dashboard.createTeam') }}</el-button>
                <el-button type="info" icon="Document">{{ t('dashboard.viewDocs') }}</el-button>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="24" class="activity-col">
            <el-card shadow="hover" class="activity-card">
              <template #header>
                <div class="card-header">
                  <span>{{ t('dashboard.recentActivity') }}</span>
                </div>
              </template>
              <div v-if="loading" class="activity-loading">
                <el-skeleton :rows="5" animated />
              </div>
              <div v-else-if="recentActivities.length === 0" class="no-activity">
                {{ t('dashboard.noActivity') }}
              </div>
              <div v-else class="activity-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div class="activity-icon" :class="activity.type">
                    <el-icon v-if="activity.type === 'api_create'"><Plus /></el-icon>
                    <el-icon v-else-if="activity.type === 'team_join'"><UserFilled /></el-icon>
                    <el-icon v-else-if="activity.type === 'api_call'"><Connection /></el-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-name">{{ activity.name }}</div>
                    <div class="activity-time">{{ new Date(activity.time).toLocaleString() }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-section h1 {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 36px;
  font-weight: 600;
  color: #409EFF;
  text-align: center;
  padding: 10px 0;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.time-range-selector {
  margin-left: auto;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-col {
  margin-top: 20px;
}

.activity-card {
  height: calc(100% - 20px);
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #EBEEF5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.activity-icon.api_create {
  background-color: #67C23A;
  color: white;
}

.activity-icon.team_join {
  background-color: #409EFF;
  color: white;
}

.activity-icon.api_call {
  background-color: #E6A23C;
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.no-activity {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.card-loading, .chart-loading, .activity-loading {
  padding: 20px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-value {
    font-size: 28px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>
