---
title: 仪表盘
---

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import DashboardPage from '@theme/components/DashboardPage.vue';

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
</script>

<ClientOnly>
  <div v-if="isLoggedIn">
    <DashboardPage />
  </div>
  <div v-else>
    <p>正在检查登录状态...</p>
  </div>
</ClientOnly>
