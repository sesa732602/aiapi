# 接口管理平台

## 项目介绍

接口管理平台是一个功能强大的API文档展示、管理和售卖系统，支持团队协作、版本控制、权限管理、接口售卖和并发量管理等功能。系统采用TypeScript开发，后端使用Node.js，前端使用VitePress和Element Plus组件库，支持多语言切换。

## 主要功能

- **API文档展示**：清晰展示API接口文档，支持多版本管理
- **团队协作**：支持团队创建、成员管理和权限分配
- **接口权限管理**：精细控制API访问权限
- **版本控制**：支持API版本管理和历史版本查看
- **接口售卖**：支持创建不同套餐，设置调用次数和并发量限制
- **多种登录方式**：支持用户名密码、Google和微信登录
- **多语言支持**：支持中英文切换，可扩展其他语言
- **数据统计分析**：提供API调用统计和收入分析

## 技术栈

### 后端
- Node.js
- Express
- TypeScript
- TypeORM
- MySQL
- JWT认证

### 前端
- VitePress
- Vue 3
- TypeScript
- Element Plus
- Vue I18n
- ECharts
- Axios

## 系统架构

系统采用前后端分离架构：

1. **前端**：VitePress构建的单页应用，使用Element Plus组件库和Vue 3框架
2. **后端**：Node.js + Express构建的RESTful API服务
3. **数据库**：MySQL关系型数据库
4. **认证**：JWT token认证 + 第三方OAuth认证

## 安装与运行

### 环境要求
- Node.js 16.x或更高版本
- MySQL 8.0或更高版本
- npm 8.x或更高版本

### 后端安装
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 创建.env文件并配置环境变量
cp .env.example .env

# 编辑.env文件，配置数据库连接等信息
nano .env

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### 前端安装
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 数据库配置

在`.env`文件中配置数据库连接信息：

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=api_management
```

## 用户角色与权限

系统包含以下用户角色：

1. **超级管理员**：可以管理所有用户、团队、API，可以充值用户额度
2. **管理员**：可以管理自己创建的团队和API
3. **普通用户**：可以使用已授权的API，购买API套餐

团队内部角色：

1. **团队拥有者**：可以管理团队所有资源
2. **团队管理员**：可以管理团队API但不能删除团队
3. **团队成员**：可以查看和使用团队API

## API文档

系统内置了API文档，可通过以下方式访问：

1. 启动后端服务
2. 访问 `http://localhost:3000/api-docs`

## 多语言支持

系统默认支持中文和英文，可以通过以下步骤添加新语言：

1. 在`frontend/docs/.vitepress/i18n/messages.ts`中添加新语言的翻译
2. 在`frontend/docs/.vitepress/theme/index.ts`中注册新语言

## 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行前端测试
cd frontend
npm test
```

详细的测试计划请参考`test-plan.md`文件。

## 部署

### 后端部署
```bash
cd backend
npm run build
npm run start
```

### 前端部署
```bash
cd frontend
npm run build
# 将dist目录部署到Web服务器
```

## 常见问题

1. **Q: 如何重置管理员密码？**
   A: 可以通过数据库直接修改，或使用后端提供的密码重置API。

2. **Q: 如何配置第三方登录？**
   A: 在`.env`文件中配置Google和微信的OAuth信息。

3. **Q: 如何备份数据？**
   A: 可以使用MySQL的备份工具，如mysqldump。

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参见LICENSE文件

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。
