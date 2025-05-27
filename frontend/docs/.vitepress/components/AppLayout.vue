/**
 * 应用布局组件
 */
<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElConfigProvider } from 'element-plus';

// 国际化
const { t, locale } = useI18n();

// 获取全局提供的语言切换方法和Element Plus语言包
const toggleLocale = inject('toggleLocale');
const currentLocale = inject('currentLocale', ref('zh-CN'));
const elementLocale = inject('elementLocale');

// 侧边栏折叠状态
const isCollapse = ref(false);

// 用户信息
const userInfo = ref({
  username: 'Admin',
  role: 'super_admin'
});

// 语言选项
const languages = [
  { value: 'zh-CN', label: t('language.simplified_chinese') },
  { value: 'en', label: t('language.english') }
];

// 是否已登录
const isLoggedIn = ref(false);

// 计算属性：是否为超级管理员
const isSuperAdmin = computed(() => {
  return userInfo.value.role === 'super_admin';
});

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

// 切换语言
const changeLanguage = (lang) => {
  // 使用全局提供的语言切换方法
  if (toggleLocale) {
    toggleLocale(lang);
  } else {
    // 兼容旧版本
    locale.value = lang;
    currentLocale.value = lang;
    localStorage.setItem('locale', lang);
  }
  
  ElMessage.success(t('common.languageChanged'));
};

// 退出登录
const logout = () => {
  // 这里应该调用实际的API
  // await api.logout();
  
  // 清除本地存储的token
  localStorage.removeItem('token');
  
  // 跳转到登录页
  window.location.href = '/login';
};

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  
  // 如果未登录且不在登录或注册页面，则跳转到登录页
  if (!isLoggedIn.value && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
    window.location.href = '/login';
  }
  
  // 如果已登录且在登录或注册页面，则跳转到仪表盘
  if (isLoggedIn.value && (window.location.pathname.includes('/login') || window.location.pathname.includes('/register'))) {
    window.location.href = '/dashboard';
  }
};

// 组件挂载时检查登录状态和加载用户信息
onMounted(() => {
  checkLoginStatus();
  
  // 如果已登录，加载用户信息
  if (isLoggedIn.value) {
    // 这里应该调用实际的API
    // const response = await api.getCurrentUser();
    // userInfo.value = response.data;
  }
});
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <div class="app-container" :class="{ 'is-collapsed': isCollapse }">
      <!-- 登录/注册页面不显示侧边栏和顶部栏 -->
      <template v-if="!isLoggedIn">
        <slot></slot>
      </template>
      
      <template v-else>
        <!-- 侧边栏 -->
        <el-aside width="auto" class="sidebar">
          <div class="logo-container">
            <img src="/logo.png" alt="Logo" class="logo" v-if="!isCollapse" />
            <img src="/logo-small.png" alt="Logo" class="logo-small" v-else />
          </div>
          
          <el-menu
            :default-active="$route.path"
            class="sidebar-menu"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
          >
            <el-menu-item index="/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <template #title>{{ t('nav.dashboard') }}</template>
            </el-menu-item>
            
            <el-menu-item index="/api">
              <el-icon><Connection /></el-icon>
              <template #title>{{ t('nav.apiDocs') }}</template>
            </el-menu-item>
            
            <el-menu-item index="/team">
              <el-icon><UserFilled /></el-icon>
              <template #title>{{ t('nav.teamManagement') }}</template>
            </el-menu-item>
            
            <el-menu-item index="/order">
              <el-icon><Tickets /></el-icon>
              <template #title>{{ t('nav.orderManagement') }}</template>
            </el-menu-item>
            
            <el-menu-item index="/stats">
              <el-icon><DataAnalysis /></el-icon>
              <template #title>{{ t('nav.statistics') }}</template>
            </el-menu-item>
            
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <template #title>{{ t('nav.userCenter') }}</template>
            </el-menu-item>
            
            <el-menu-item v-if="isSuperAdmin" index="/admin">
              <el-icon><Setting /></el-icon>
              <template #title>{{ t('nav.adminPanel') }}</template>
            </el-menu-item>
          </el-menu>
          
          <div class="sidebar-footer">
            <el-tooltip :content="isCollapse ? t('nav.expand') : t('nav.collapse')" placement="right">
              <el-button class="collapse-button" @click="toggleSidebar">
                <el-icon>
                  <Fold v-if="!isCollapse" />
                  <Expand v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </el-aside>
        
        <!-- 主内容区 -->
        <el-container class="main-container">
          <!-- 顶部栏 -->
          <el-header class="header">
            <div class="header-left">
              <h2 class="page-title">{{ t('app.title') }}</h2>
            </div>
            
            <div class="header-right">
              <!-- 语言切换 -->
              <el-dropdown @command="changeLanguage">
                <span class="language-dropdown">
                  {{ currentLocale === 'zh-CN' ? t('language.simplified_chinese') : t('language.english') }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="lang in languages"
                      :key="lang.value"
                      :command="lang.value"
                      :disabled="currentLocale === lang.value"
                    >
                      {{ lang.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              
              <!-- 用户菜单 -->
              <el-dropdown @command="(command) => command === 'logout' && logout()">
                <span class="user-dropdown">
                  {{ userInfo.username }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon><User /></el-icon>
                      {{ t('nav.userCenter') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="settings">
                      <el-icon><Setting /></el-icon>
                      {{ t('nav.settings') }}
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon><SwitchButton /></el-icon>
                      {{ t('nav.logout') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>
          
          <!-- 内容区 -->
          <el-main class="content">
            <slot></slot>
          </el-main>
          
          <!-- 页脚 -->
          <el-footer class="footer">
            <div class="footer-content">
              <p>{{ t('app.footerCopyright') }}</p>
            </div>
          </el-footer>
        </el-container>
      </template>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
}

.sidebar {
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #263445;
}

.logo {
  height: 40px;
}

.logo-small {
  height: 30px;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 10px;
  display: flex;
  justify-content: center;
}

.collapse-button {
  background: transparent;
  border: none;
  color: #bfcbd9;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-dropdown,
.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

.content {
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px !important;
}

.footer-content {
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100% !important;
    height: auto;
  }
  
  .sidebar-menu:not(.el-menu--collapse) {
    width: 100%;
  }
  
  .main-container {
    height: calc(100vh - 60px);
  }
  
  .header {
    padding: 0 10px;
  }
  
  .page-title {
    font-size: 16px;
  }
}
</style>
