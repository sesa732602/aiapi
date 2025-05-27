/**
 * 注册和登录接口测试脚本
 */
import axios, { AxiosError } from 'axios';

// 测试配置
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  username: 'testuser_' + Date.now(),
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

// 存储测试过程中生成的token
let authToken = '';

/**
 * 测试用户注册接口
 */
async function testRegister() {
  console.log('\n===== 测试用户注册 =====');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, TEST_USER);
    console.log('注册成功:', response.data);
    
    // 验证响应格式
    if (response.data.success && response.data.data.token && response.data.data.user) {
      console.log('✅ 注册接口响应格式正确');
      // 保存token用于后续测试
      authToken = response.data.data.token;
    } else {
      console.log('❌ 注册接口响应格式错误');
    }
    
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('注册失败:', error.response?.data || error.message);
    } else {
      console.error('注册失败:', error);
    }
    return false;
  }
}

/**
 * 测试重复用户名注册
 */
async function testDuplicateUsernameRegister() {
  console.log('\n===== 测试重复用户名注册 =====');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, TEST_USER);
    console.log('❌ 重复用户名注册应该失败，但成功了:', response.data);
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409 && error.response?.data?.success === false) {
        console.log('✅ 重复用户名注册被正确拒绝:', error.response.data);
        return true;
      } else {
        console.error('❌ 重复用户名注册失败，但状态码或响应格式不正确:', error.response?.data);
        return false;
      }
    } else {
      console.error('❌ 测试过程中发生非HTTP错误:', error);
      return false;
    }
  }
}

/**
 * 测试无效输入注册
 */
async function testInvalidInputRegister() {
  console.log('\n===== 测试无效输入注册 =====');
  const invalidUser = {
    username: 'a', // 太短
    email: 'invalid-email', // 无效邮箱
    password: '123' // 太简单
  };
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, invalidUser);
    console.log('❌ 无效输入注册应该失败，但成功了:', response.data);
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.log('✅ 无效输入注册被正确拒绝:', error.response.data);
        return true;
      } else {
        console.error('❌ 无效输入注册失败，但状态码或响应格式不正确:', error.response?.data);
        return false;
      }
    } else {
      console.error('❌ 测试过程中发生非HTTP错误:', error);
      return false;
    }
  }
}

/**
 * 测试用户登录接口
 */
async function testLogin() {
  console.log('\n===== 测试用户登录 =====');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    console.log('登录成功:', response.data);
    
    // 验证响应格式
    if (response.data.success && response.data.data.token && response.data.data.user) {
      console.log('✅ 登录接口响应格式正确');
      // 更新token
      authToken = response.data.data.token;
      return true;
    } else {
      console.log('❌ 登录接口响应格式错误');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('登录失败:', error.response?.data || error.message);
    } else {
      console.error('登录失败:', error);
    }
    return false;
  }
}

/**
 * 测试错误密码登录
 */
async function testWrongPasswordLogin() {
  console.log('\n===== 测试错误密码登录 =====');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: 'WrongPassword123!'
    });
    console.log('❌ 错误密码登录应该失败，但成功了:', response.data);
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && error.response?.data?.success === false) {
        console.log('✅ 错误密码登录被正确拒绝:', error.response.data);
        return true;
      } else {
        console.error('❌ 错误密码登录失败，但状态码或响应格式不正确:', error.response?.data);
        return false;
      }
    } else {
      console.error('❌ 测试过程中发生非HTTP错误:', error);
      return false;
    }
  }
}

/**
 * 测试获取当前用户信息
 */
async function testGetCurrentUser() {
  console.log('\n===== 测试获取当前用户信息 =====');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('获取用户信息成功:', response.data);
    
    // 验证响应格式和用户信息
    if (
      response.data.success && 
      response.data.data.user && 
      response.data.data.user.username === TEST_USER.username
    ) {
      console.log('✅ 获取用户信息接口响应格式正确');
      return true;
    } else {
      console.log('❌ 获取用户信息接口响应格式错误或用户信息不匹配');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('获取用户信息失败:', error.response?.data || error.message);
    } else {
      console.error('获取用户信息失败:', error);
    }
    return false;
  }
}

/**
 * 测试未授权访问
 */
async function testUnauthorizedAccess() {
  console.log('\n===== 测试未授权访问 =====');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    console.log('❌ 未授权访问应该失败，但成功了:', response.data);
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && error.response?.data?.success === false) {
        console.log('✅ 未授权访问被正确拒绝:', error.response.data);
        return true;
      } else {
        console.error('❌ 未授权访问失败，但状态码或响应格式不正确:', error.response?.data);
        return false;
      }
    } else {
      console.error('❌ 测试过程中发生非HTTP错误:', error);
      return false;
    }
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始测试注册和登录接口...');
  
  // 记录测试结果
  const results = {
    register: await testRegister(),
    duplicateRegister: await testDuplicateUsernameRegister(),
    invalidInputRegister: await testInvalidInputRegister(),
    login: await testLogin(),
    wrongPasswordLogin: await testWrongPasswordLogin(),
    getCurrentUser: await testGetCurrentUser(),
    unauthorizedAccess: await testUnauthorizedAccess()
  };
  
  // 输出测试摘要
  console.log('\n===== 测试摘要 =====');
  for (const [test, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  }
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n总结: ${passedCount}/${totalCount} 测试通过`);
  
  return passedCount === totalCount;
}

// 执行测试
runAllTests()
  .then(allPassed => {
    console.log(allPassed ? '\n🎉 所有测试通过!' : '\n❌ 部分测试失败，请检查详细输出');
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
