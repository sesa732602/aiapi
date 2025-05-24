/**
 * 用户中心页面
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

// 退出登录
const logout = () => {
  localStorage.removeItem('user');
  ElMessage.success('已退出登录');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
};
</script>

<template>
  <div v-if="isLoggedIn">
    <h1>用户中心</h1>
    
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
          <el-button type="primary" size="small">编辑资料</el-button>
        </div>
      </template>
      
      <div class="user-info">
        <div class="avatar">
          <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        </div>
        
        <div class="info">
          <p><strong>用户名:</strong> {{ userInfo.username }}</p>
          <p><strong>角色:</strong> {{ userInfo.role === 'admin' ? '管理员' : userInfo.role === 'super_admin' ? '超级管理员' : '普通用户' }}</p>
          <p><strong>注册时间:</strong> {{ new Date().toLocaleDateString() }}</p>
        </div>
      </div>
      
      <div class="actions">
        <el-button type="danger" @click="logout">退出登录</el-button>
      </div>
    </el-card>
    
    <el-card class="stats-card">
      <template #header>
        <div class="card-header">
          <span>账户统计</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <h3>API数量</h3>
            <p class="stat-value">5</p>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-item">
            <h3>团队数量</h3>
            <p class="stat-value">2</p>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-item">
            <h3>订单数量</h3>
            <p class="stat-value">8</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="recent-activity-card">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in 5"
          :key="index"
          :timestamp="new Date(Date.now() - index * 86400000).toLocaleString()"
          placement="top"
        >
          <el-card>
            <h4>活动 {{ 5 - index }}</h4>
            <p>这是一条模拟的活动记录，展示用户最近的操作历史。</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
  <div v-else>
    <p>正在检查登录状态...</p>
  </div>
</template>

<style scoped>
.user-info-card,
.stats-card,
.recent-activity-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  margin-bottom: 20px;
}

.avatar {
  margin-right: 20px;
}

.info p {
  margin: 8px 0;
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

.actions {
  margin-top: 20px;
  text-align: right;
}
</style>
