# 接口管理网站系统架构设计

## 1. 整体架构

### 1.1 技术栈
- **前端**：VitePress + TypeScript + Vue3
- **后端**：Node.js + Express + TypeScript
- **数据库**：MySQL
- **认证**：JWT + OAuth2.0（Google登录、微信登录）
- **文档**：Swagger/OpenAPI

### 1.2 系统模块
```
接口管理平台
├── 用户认证模块
│   ├── 用户名密码登录
│   ├── Google OAuth登录
│   ├── 微信OAuth登录
│   └── JWT令牌管理
├── 用户权限模块
│   ├── 超级管理员
│   ├── 管理员
│   └── 权限控制
├── API文档模块
│   ├── 文档展示
│   ├── 文档编辑
│   └── 版本控制
├── 团队协作模块
│   ├── 团队管理
│   ├── 成员管理
│   └── 协作流程
├── 接口售卖模块
│   ├── 套餐管理
│   ├── 订单管理
│   └── 支付集成
└── 并发量管理模块
    ├── 调用次数统计
    ├── 并发量控制
    └── 限流策略
```

## 2. 数据库设计

### 2.1 用户表 (users)
```
- id: int (主键)
- username: varchar(50) (用户名)
- password: varchar(255) (加密密码)
- email: varchar(100) (邮箱)
- role: enum('super_admin', 'admin') (角色)
- google_id: varchar(100) (Google ID，可为空)
- wechat_id: varchar(100) (微信ID，可为空)
- created_at: timestamp
- updated_at: timestamp
```

### 2.2 团队表 (teams)
```
- id: int (主键)
- name: varchar(100) (团队名称)
- description: text (团队描述)
- owner_id: int (外键，关联users表)
- created_at: timestamp
- updated_at: timestamp
```

### 2.3 团队成员表 (team_members)
```
- id: int (主键)
- team_id: int (外键，关联teams表)
- user_id: int (外键，关联users表)
- role: enum('owner', 'admin', 'member') (团队内角色)
- created_at: timestamp
- updated_at: timestamp
```

### 2.4 API接口表 (apis)
```
- id: int (主键)
- name: varchar(100) (接口名称)
- description: text (接口描述)
- path: varchar(255) (接口路径)
- method: enum('GET', 'POST', 'PUT', 'DELETE', 'PATCH') (HTTP方法)
- team_id: int (外键，关联teams表)
- creator_id: int (外键，关联users表)
- is_public: boolean (是否公开)
- created_at: timestamp
- updated_at: timestamp
```

### 2.5 API版本表 (api_versions)
```
- id: int (主键)
- api_id: int (外键，关联apis表)
- version: varchar(20) (版本号)
- spec: text (API规范，JSON格式)
- creator_id: int (外键，关联users表)
- is_current: boolean (是否为当前版本)
- created_at: timestamp
- updated_at: timestamp
```

### 2.6 API权限表 (api_permissions)
```
- id: int (主键)
- api_id: int (外键，关联apis表)
- team_id: int (外键，关联teams表，可为空)
- user_id: int (外键，关联users表，可为空)
- permission_type: enum('read', 'write', 'admin') (权限类型)
- created_at: timestamp
- updated_at: timestamp
```

### 2.7 API套餐表 (api_plans)
```
- id: int (主键)
- api_id: int (外键，关联apis表)
- name: varchar(100) (套餐名称)
- description: text (套餐描述)
- price: decimal(10,2) (价格)
- call_limit: int (调用次数限制)
- concurrency_limit: int (并发数限制)
- duration_days: int (有效期，天数)
- created_at: timestamp
- updated_at: timestamp
```

### 2.8 订单表 (orders)
```
- id: int (主键)
- user_id: int (外键，关联users表)
- plan_id: int (外键，关联api_plans表)
- amount: decimal(10,2) (金额)
- status: enum('pending', 'paid', 'cancelled', 'refunded') (状态)
- payment_method: varchar(50) (支付方式)
- transaction_id: varchar(100) (交易ID)
- created_at: timestamp
- updated_at: timestamp
```

### 2.9 API调用记录表 (api_calls)
```
- id: int (主键)
- api_id: int (外键，关联apis表)
- user_id: int (外键，关联users表)
- timestamp: timestamp (调用时间)
- status_code: int (状态码)
- response_time: int (响应时间，毫秒)
- ip_address: varchar(45) (IP地址)
```

### 2.10 用户额度表 (user_quotas)
```
- id: int (主键)
- user_id: int (外键，关联users表)
- api_id: int (外键，关联apis表)
- calls_remaining: int (剩余调用次数)
- concurrency_limit: int (并发限制)
- expires_at: timestamp (过期时间)
- created_at: timestamp
- updated_at: timestamp
```

## 3. API接口设计

### 3.1 用户认证接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户名密码登录
- GET /api/auth/google - Google登录
- GET /api/auth/wechat - 微信登录
- POST /api/auth/logout - 退出登录
- GET /api/auth/me - 获取当前用户信息

### 3.2 用户管理接口
- GET /api/users - 获取用户列表（管理员）
- GET /api/users/:id - 获取用户详情
- PUT /api/users/:id - 更新用户信息
- DELETE /api/users/:id - 删除用户（管理员）

### 3.3 团队管理接口
- POST /api/teams - 创建团队
- GET /api/teams - 获取团队列表
- GET /api/teams/:id - 获取团队详情
- PUT /api/teams/:id - 更新团队信息
- DELETE /api/teams/:id - 删除团队
- POST /api/teams/:id/members - 添加团队成员
- DELETE /api/teams/:id/members/:userId - 移除团队成员
- PUT /api/teams/:id/members/:userId/role - 更新成员角色

### 3.4 API管理接口
- POST /api/apis - 创建API
- GET /api/apis - 获取API列表
- GET /api/apis/:id - 获取API详情
- PUT /api/apis/:id - 更新API信息
- DELETE /api/apis/:id - 删除API
- POST /api/apis/:id/versions - 创建API版本
- GET /api/apis/:id/versions - 获取API版本列表
- PUT /api/apis/:id/versions/:versionId/current - 设置当前版本

### 3.5 API权限接口
- POST /api/apis/:id/permissions - 添加API权限
- GET /api/apis/:id/permissions - 获取API权限列表
- DELETE /api/apis/:id/permissions/:permissionId - 删除API权限

### 3.6 API套餐接口
- POST /api/apis/:id/plans - 创建API套餐
- GET /api/apis/:id/plans - 获取API套餐列表
- PUT /api/apis/:id/plans/:planId - 更新API套餐
- DELETE /api/apis/:id/plans/:planId - 删除API套餐

### 3.7 订单管理接口
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id/pay - 支付订单
- PUT /api/orders/:id/cancel - 取消订单

### 3.8 API调用统计接口
- GET /api/stats/calls - 获取API调用统计
- GET /api/stats/users - 获取用户调用统计
- GET /api/stats/revenue - 获取收入统计（管理员）

## 4. 前端页面设计

### 4.1 公共页面
- 登录页面
- 注册页面
- 首页/着陆页

### 4.2 用户页面
- 个人资料页面
- 我的API页面
- 我的订单页面
- 我的团队页面

### 4.3 API管理页面
- API列表页面
- API详情页面
- API文档编辑页面
- API版本管理页面
- API权限管理页面

### 4.4 团队管理页面
- 团队列表页面
- 团队详情页面
- 团队成员管理页面

### 4.5 接口售卖页面
- 套餐管理页面
- 订单管理页面
- 收入统计页面

### 4.6 系统管理页面（超级管理员）
- 用户管理页面
- 系统设置页面
- 系统监控页面

## 5. 安全设计

### 5.1 认证安全
- 使用JWT进行身份验证
- 密码加盐哈希存储
- OAuth2.0安全集成
- 会话超时机制

### 5.2 授权安全
- 基于角色的访问控制(RBAC)
- API级别的权限控制
- 团队级别的权限控制

### 5.3 数据安全
- 敏感数据加密存储
- HTTPS传输加密
- SQL注入防护
- XSS防护

### 5.4 接口安全
- 接口限流
- API密钥认证
- 请求签名验证
- CORS安全配置

## 6. 部署架构

### 6.1 开发环境
- 本地开发环境
- 代码版本控制(Git)
- CI/CD流程

### 6.2 生产环境
- Node.js应用服务器
- MySQL数据库服务器
- Nginx反向代理
- Redis缓存(可选)
- 监控系统(可选)

## 7. 扩展性考虑

### 7.1 水平扩展
- 无状态API设计
- 负载均衡配置
- 数据库读写分离

### 7.2 功能扩展
- 插件系统
- 自定义钩子
- 事件驱动架构
