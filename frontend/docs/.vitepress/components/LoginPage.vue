/**
 * 登录页面组件
 */
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

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
    ElMessage.error('用户名和密码不能为空');
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
    
    ElMessage.success('登录成功');
    
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
  <div class="login-container">
    <div class="login-box">
      <h2>接口管理平台</h2>
      <p class="subtitle">登录您的账户</p>
      
      <el-form :model="loginForm" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-select v-model="loginForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
        
        <div class="quick-login">
          <p>快速登录:</p>
          <el-button type="info" size="small" @click="quickLogin('admin')">管理员登录</el-button>
          <el-button type="info" size="small" @click="quickLogin('user')">用户登录</el-button>
        </div>
        
        <div class="other-login">
          <p>其他登录方式:</p>
          <div class="login-icons">
            <el-button type="success" size="small">Google登录</el-button>
            <el-button type="success" size="small">微信登录</el-button>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
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
