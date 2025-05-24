// .vitepress/i18n/index.ts
export default {
  'zh-CN': {
    // 导航栏
    nav: {
      home: '首页',
      apiDocs: 'API文档',
      teamManagement: '团队管理',
      userCenter: '用户中心'
    },
    // 侧边栏
    sidebar: {
      apiManagement: 'API管理',
      apiOverview: 'API概览',
      createApi: '创建API',
      versionControl: '版本控制',
      permissionManagement: '权限管理',
      apiSelling: '接口售卖',
      planManagement: '套餐管理',
      orderManagement: '订单管理',
      statistics: '统计分析',
      teamManagement: '团队管理',
      teamOverview: '团队概览',
      createTeam: '创建团队',
      memberManagement: '成员管理',
      userCenter: '用户中心',
      profile: '个人资料',
      myApis: '我的API',
      myOrders: '我的订单',
      rechargeManagement: '充值管理'
    },
    // 首页
    home: {
      title: '接口管理平台',
      description: '一个功能强大的API管理解决方案',
      features: {
        apiDocs: 'API文档展示',
        permissionManagement: '接口权限管理',
        teamCollaboration: '团队协作功能',
        versionControl: '版本控制',
        apiSelling: '接口售卖',
        concurrencyManagement: '并发量管理'
      },
      userRoles: {
        title: '用户角色',
        superAdmin: '超级管理员：系统最高权限，可管理所有资源',
        admin: '管理员：管理特定团队和API资源'
      },
      quickStart: {
        title: '快速开始',
        step1: '注册账号或使用以下方式登录',
        loginMethods: {
          password: '用户名密码登录',
          google: 'Google账号登录',
          wechat: '微信账号登录'
        },
        step2: '创建您的第一个API',
        step3: '设置权限和访问控制',
        step4: '发布并开始管理您的API'
      },
      techStack: {
        title: '技术栈',
        frontend: '前端：VitePress + TypeScript + Vue3 + Element Plus',
        backend: '后端：Node.js + Express + TypeScript',
        database: '数据库：MySQL'
      }
    }
  },
  'en': {
    // Navigation
    nav: {
      home: 'Home',
      apiDocs: 'API Docs',
      teamManagement: 'Team Management',
      userCenter: 'User Center'
    },
    // Sidebar
    sidebar: {
      apiManagement: 'API Management',
      apiOverview: 'API Overview',
      createApi: 'Create API',
      versionControl: 'Version Control',
      permissionManagement: 'Permission Management',
      apiSelling: 'API Selling',
      planManagement: 'Plan Management',
      orderManagement: 'Order Management',
      statistics: 'Statistics',
      teamManagement: 'Team Management',
      teamOverview: 'Team Overview',
      createTeam: 'Create Team',
      memberManagement: 'Member Management',
      userCenter: 'User Center',
      profile: 'Profile',
      myApis: 'My APIs',
      myOrders: 'My Orders',
      rechargeManagement: 'Recharge Management'
    },
    // Home page
    home: {
      title: 'API Management Platform',
      description: 'A powerful API management solution',
      features: {
        apiDocs: 'API Documentation Display',
        permissionManagement: 'API Permission Management',
        teamCollaboration: 'Team Collaboration',
        versionControl: 'Version Control',
        apiSelling: 'API Selling',
        concurrencyManagement: 'Concurrency Management'
      },
      userRoles: {
        title: 'User Roles',
        superAdmin: 'Super Admin: Highest system privileges, can manage all resources',
        admin: 'Admin: Manage specific teams and API resources'
      },
      quickStart: {
        title: 'Quick Start',
        step1: 'Register an account or login using:',
        loginMethods: {
          password: 'Username and password',
          google: 'Google account',
          wechat: 'WeChat account'
        },
        step2: 'Create your first API',
        step3: 'Set permissions and access control',
        step4: 'Publish and start managing your API'
      },
      techStack: {
        title: 'Tech Stack',
        frontend: 'Frontend: VitePress + TypeScript + Vue3 + Element Plus',
        backend: 'Backend: Node.js + Express + TypeScript',
        database: 'Database: MySQL'
      }
    }
  }
}
