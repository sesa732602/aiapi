# 接口管理平台部署指南（更新版）

## 1. 项目概述

接口管理平台是一个功能完整的API接口管理系统，使用TypeScript开发，后端采用Node.js，前端采用VitePress和Element Plus组件库，支持多语言切换。系统支持API文档展示、接口权限管理、团队协作、版本控制、接口售卖和并发量管理等功能。

## 2. 系统要求

- Node.js 16.x 或更高版本
- MySQL 8.0 或更高版本
- 现代浏览器（Chrome、Firefox、Safari、Edge等）

## 3. 部署架构

本项目采用前后端分离架构，部署时可以选择以下方式：

1. **集成部署**：前端静态资源和后端API服务集成在同一个服务器
2. **分离部署**：前端静态资源和后端API服务分别部署在不同服务器

## 4. 部署步骤

### 4.1 数据库配置

1. 创建MySQL数据库：

```sql
CREATE DATABASE api_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON api_management.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```

2. 修改后端`.env`文件中的数据库配置：

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=api_user
DB_PASSWORD=your_password
DB_NAME=api_management
```

### 4.2 后端部署

1. 进入后端目录：

```bash
cd /path/to/api-management-platform/backend
```

2. 安装依赖：

```bash
npm install
```

3. 编译TypeScript代码：

```bash
npm run build
```

4. 配置环境变量（创建或修改`.env`文件）：

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=api_user
DB_PASSWORD=your_password
DB_NAME=api_management
```

5. 启动后端服务：

```bash
# 直接启动
node dist/main.js

# 或使用PM2进行进程管理（推荐）
npm install -g pm2
pm2 start dist/main.js --name api-management-backend
```

### 4.3 前端部署

1. 进入前端目录：

```bash
cd /path/to/api-management-platform/frontend
```

2. 安装依赖：

```bash
npm install
```

3. 修改API基础URL配置（如果后端不是部署在同一域名下）：

```bash
# 编辑 docs/.vitepress/api/index.ts 文件
# 将 BASE_URL 修改为后端API地址
```

4. 构建前端静态资源：

```bash
npm run build
```

5. 部署静态资源：

```bash
# 方式1：使用Node.js和Express提供静态文件服务
cd /path/to/api-management-platform
npm init -y
npm install express dotenv http-proxy-middleware
```

创建`server.js`文件：

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'frontend/docs/.vitepress/dist')));

// API代理（如果后端API部署在不同服务器）
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

// 所有其他请求返回前端应用（SPA路由支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/docs/.vitepress/dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

启动服务：

```bash
node server.js

# 或使用PM2
pm2 start server.js --name api-management-frontend
```

# 方式2：使用Nginx部署静态资源

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态资源
    location / {
        root /path/to/api-management-platform/frontend/docs/.vitepress/dist;
        index index.html;
        try_files $uri $uri/ /index.html;  # 重要：SPA路由支持
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.4 SPA路由支持

为确保单页应用(SPA)路由正常工作，需要：

1. 在前端构建目录中添加404.html文件，内容如下：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>接口管理平台</title>
  <script>
    // 重定向到首页
    window.location.href = '/';
  </script>
</head>
<body>
  <p>正在重定向到首页...</p>
</body>
</html>
```

2. 确保服务器配置将所有未找到的路由重定向到index.html：

- 对于Express服务器，使用上述server.js中的通配符路由
- 对于Nginx，使用`try_files $uri $uri/ /index.html;`指令

### 4.5 第三方登录配置

1. 配置Google登录：
   - 在[Google Cloud Console](https://console.cloud.google.com/)创建OAuth客户端ID
   - 将客户端ID和密钥添加到后端`.env`文件：
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

2. 配置微信登录：
   - 在[微信开放平台](https://open.weixin.qq.com/)注册应用
   - 将AppID和AppSecret添加到后端`.env`文件：
   ```
   WECHAT_APP_ID=your-wechat-app-id
   WECHAT_APP_SECRET=your-wechat-app-secret
   ```

## 5. 演示环境说明

当前部署的演示环境包含以下功能：

1. **SPA路由支持**：所有页面路由均可直接访问，刷新不会导致404错误
2. **本地登录演示**：支持用户和管理员角色登录
   - 用户登录：用户名 `user`，密码 `user123`
   - 管理员登录：用户名 `admin`，密码 `admin123`
3. **核心功能演示**：
   - 用户中心
   - API管理
   - 团队管理

注意：演示环境使用本地存储(localStorage)模拟登录状态，实际生产环境应使用JWT或其他安全认证机制。

## 6. 系统初始化

1. 创建超级管理员账户：

```bash
# 使用以下命令创建超级管理员账户
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"username":"admin","email":"admin@example.com","password":"your-secure-password","role":"super_admin"}'
```

2. 登录系统并验证功能：
   - 访问前端页面
   - 使用超级管理员账户登录
   - 创建团队、API和权限配置

## 7. 系统维护

### 7.1 日志管理

如果使用PM2，可以通过以下命令查看日志：

```bash
# 查看后端日志
pm2 logs api-management-backend

# 查看前端日志
pm2 logs api-management-frontend
```

### 7.2 数据库备份

定期备份MySQL数据库：

```bash
mysqldump -u api_user -p api_management > backup_$(date +%Y%m%d).sql
```

### 7.3 系统更新

1. 拉取最新代码：

```bash
cd /path/to/api-management-platform
git pull
```

2. 更新后端：

```bash
cd backend
npm install
npm run build
pm2 restart api-management-backend
```

3. 更新前端：

```bash
cd frontend
npm install
npm run build
# 如果使用PM2部署前端
pm2 restart api-management-frontend
```

## 8. 故障排除

### 8.1 常见问题

1. **SPA路由404错误**
   - 检查服务器配置是否正确重定向到index.html
   - 确认404.html文件存在并正确配置
   - 验证服务器是否正确处理所有路由

2. **登录失败**
   - 检查浏览器控制台是否有错误信息
   - 验证localStorage是否正常工作
   - 确认登录API是否正确响应

3. **数据库连接失败**
   - 检查数据库凭据和连接信息
   - 确认MySQL服务正在运行
   - 检查防火墙设置

4. **API请求失败**
   - 检查后端服务是否正常运行
   - 验证API路由配置
   - 检查代理设置

5. **前端页面加载问题**
   - 清除浏览器缓存
   - 检查JavaScript控制台错误
   - 验证静态资源是否正确部署

### 8.2 联系支持

如需进一步的技术支持，请联系系统管理员或开发团队。

## 9. 安全建议

1. 使用HTTPS加密所有通信
2. 定期更新系统和依赖包
3. 使用强密码并定期更换
4. 限制数据库用户权限
5. 配置适当的CORS策略
6. 实施速率限制以防止暴力攻击
7. 定期审核用户权限和访问日志
