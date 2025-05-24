/**
 * 部署配置文件
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析JSON请求体
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'frontend')));

// 简单API路由示例
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: '接口管理平台API服务正常运行' });
});

// 所有其他请求返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
