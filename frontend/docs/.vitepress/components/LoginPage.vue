/**
 * 登录页面组件
 */
<script setup lang="ts">
import { ref, reactive, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';

// 国际化
const { t } = useI18n();
const elementLocale = inject('elementLocale');

// 模拟路由
const router = {
  push: (path: string) => {
    window.location.href = path;
  }
};

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  role: 'user' // 默认为普通用户
});

// 加载状态
const loading = ref(false);

// 登录方法
const handleLogin = () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.error(t('login.emptyError'));
    return;
  }

  loading.value = true;

  // 模拟登录请求
  setTimeout(() => {
    loading.value = false;
    
    // 模拟登录成功
    localStorage.setItem('user', JSON.stringify({
      username: loginForm.username,
      role: loginForm.role,
      token: 'mock-token-' + Date.now()
    }));
    
    ElMessage.success(t('login.loginSuccess'));
    
    // 根据角色跳转到不同页面
    if (loginForm.role === 'admin' || loginForm.role === 'super_admin') {
      router.push('/api/');
    } else {
      router.push('/user/');
    }
  }, 1000);
};

// 快速登录预设
const quickLogin = (role: string) => {
  if (role === 'admin') {
    loginForm.username = 'admin';
    loginForm.password = 'admin123';
    loginForm.role = 'admin';
  } else {
    loginForm.username = 'user';
    loginForm.password = 'user123';
    loginForm.role = 'user';
  }
  handleLogin();
};
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <div class="login-container">
      <div class="language-switcher-container">
        <LanguageSwitcher />
      </div>
      
      <div class="login-box">
        <h2>{{ t('login.title') }}</h2>
        <p class="subtitle">{{ t('login.subtitle') }}</p>
        
        <el-form :model="loginForm" label-position="top">
          <el-form-item :label="t('login.username')">
            <el-input v-model="loginForm.username" :placeholder="t('login.usernamePlaceholder')" />
          </el-form-item>
          
          <el-form-item :label="t('login.password')">
            <el-input v-model="loginForm.password" type="password" :placeholder="t('login.passwordPlaceholder')" />
          </el-form-item>
          
          <el-form-item :label="t('login.role')">
            <el-select v-model="loginForm.role" :placeholder="t('login.rolePlaceholder')" style="width: 100%">
              <el-option :label="t('login.userRole.user')" value="user" />
              <el-option :label="t('login.userRole.admin')" value="admin" />
              <el-option :label="t('login.userRole.super_admin')" value="super_admin" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
              {{ t('login.loginButton') }}
            </el-button>
          </el-form-item>
          
          <div class="quick-login">
            <p>{{ t('login.quickLogin') }}</p>
            <el-button type="info" size="small" @click="quickLogin('admin')">{{ t('login.adminLogin') }}</el-button>
            <el-button type="info" size="small" @click="quickLogin('user')">{{ t('login.userLogin') }}</el-button>
          </div>
          
          <div class="other-login">
            <p>{{ t('login.otherLogin') }}</p>
            <div class="login-icons">
              <el-button type="success" size="small">{{ t('login.googleLogin') }}</el-button>
              <el-button type="success" size="small">{{ t('login.wechatLogin') }}</el-button>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.language-switcher-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #409EFF;
}

.subtitle {
  text-align: center;
  margin-bottom: 30px;
  color: #606266;
}

.quick-login, .other-login {
  margin-top: 20px;
  text-align: center;
}

.quick-login p, .other-login p {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.login-icons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
