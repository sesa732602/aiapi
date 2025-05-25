/**
 * 登录与注册页面组件
 */
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 模拟路由
const router = {
  push: (path: string) => {
    window.location.href = path;
  }
};

// 当前显示模式：登录或注册
const activeMode = ref('login');

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  role: 'user' // 默认为普通用户
});

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  role: 'user' // 默认为普通用户
});

// 加载状态
const loading = ref(false);

// 切换到注册模式
const switchToRegister = () => {
  activeMode.value = 'register';
};

// 切换到登录模式
const switchToLogin = () => {
  activeMode.value = 'login';
};

// 获取本地存储的用户列表
const getLocalUsers = () => {
  const usersStr = localStorage.getItem('registered_users');
  return usersStr ? JSON.parse(usersStr) : [];
};

// 保存用户到本地存储
const saveUser = (user) => {
  const users = getLocalUsers();
  users.push(user);
  localStorage.setItem('registered_users', JSON.stringify(users));
};

// 检查用户名是否已存在
const isUsernameTaken = (username) => {
  const users = getLocalUsers();
  return users.some(user => user.username === username);
};

// 注册方法
const handleRegister = () => {
  // 表单验证
  if (!registerForm.username) {
    ElMessage.error('用户名不能为空');
    return;
  }
  
  if (!registerForm.password) {
    ElMessage.error('密码不能为空');
    return;
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  
  if (!registerForm.email) {
    ElMessage.error('邮箱不能为空');
    return;
  }
  
  // 检查用户名是否已存在
  if (isUsernameTaken(registerForm.username)) {
    ElMessage.error('用户名已被注册');
    return;
  }
  
  loading.value = true;
  
  // 模拟注册请求
  setTimeout(() => {
    loading.value = false;
    
    // 创建新用户对象
    const newUser = {
      username: registerForm.username,
      password: registerForm.password, // 实际应用中应该加密存储
      email: registerForm.email,
      role: registerForm.role,
      createdAt: new Date().toISOString()
    };
    
    // 保存用户到本地存储
    saveUser(newUser);
    
    // 自动登录
    localStorage.setItem('user', JSON.stringify({
      username: registerForm.username,
      role: registerForm.role,
      token: 'mock-token-' + Date.now()
    }));
    
    ElMessage.success('注册成功并已自动登录');
    
    // 根据角色跳转到不同页面
    if (registerForm.role === 'admin' || registerForm.role === 'super_admin') {
      router.push('/api/');
    } else {
      router.push('/user/');
    }
  }, 1000);
};

// 登录方法
const handleLogin = () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.error('用户名和密码不能为空');
    return;
  }

  loading.value = true;

  // 检查是否是预设的快速登录账号
  const isQuickLoginUser = 
    (loginForm.username === 'admin' && loginForm.password === 'admin123') || 
    (loginForm.username === 'user' && loginForm.password === 'user123');
  
  // 如果不是预设账号，则检查是否是注册用户
  if (!isQuickLoginUser) {
    const users = getLocalUsers();
    const user = users.find(u => u.username === loginForm.username);
    
    if (!user || user.password !== loginForm.password) {
      loading.value = false;
      ElMessage.error('用户名或密码错误');
      return;
    }
    
    // 如果是注册用户，使用注册时的角色
    loginForm.role = user.role;
  }

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
    <!-- 登录表单 -->
    <div v-if="activeMode === 'login'" class="login-box">
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
        
        <div class="register-link">
          <p>还没有账号？<a href="#" @click.prevent="switchToRegister">立即注册</a></p>
        </div>
        
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
    
    <!-- 注册表单 -->
    <div v-else class="login-box">
      <h2>接口管理平台</h2>
      <p class="subtitle">创建新账户</p>
      
      <el-form :model="registerForm" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-select v-model="registerForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          <p>已有账号？<a href="#" @click.prevent="switchToLogin">返回登录</a></p>
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

.register-link, .login-link {
  text-align: center;
  margin: 15px 0;
}

.register-link a, .login-link a {
  color: #409EFF;
  text-decoration: none;
}

.register-link a:hover, .login-link a:hover {
  text-decoration: underline;
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
