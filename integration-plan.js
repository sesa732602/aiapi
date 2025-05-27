/**
 * 未集成页面分析与集成计划
 */

// 已有的Markdown页面
const existingPages = [
  '/api/index.md',
  '/index.md',
  '/login.md',
  '/team/index.md',
  '/team/members.md',
  '/user/index.md',
  '/user/orders.md'
];

// 自定义Vue组件
const customComponents = [
  'ApiManagementPage.vue',
  'ApiPlanPage.vue',
  'AppLayout.vue',
  'CreateOrderPage.vue',
  'DashboardPage.vue',
  'LanguageSwitcher.vue',
  'LoginPage.vue',
  'OrderManagementPage.vue',
  'StatsPage.vue',
  'TeamManagementPage.vue',
  'UserCenterPage.vue'
];

// 侧边栏配置中的路由
const configuredRoutes = [
  '/api/',
  '/api/detail',
  '/api/versions',
  '/api/permissions',
  '/api/plans',
  '/api/purchase',
  '/team/',
  '/user/',
  '/user/apis',
  '/user/orders'
];

// 未集成的页面和对应的组件
const missingPages = [
  {
    component: 'ApiManagementPage.vue',
    route: '/api/management',
    mdFile: '/api/management.md',
    title: 'API管理',
    navGroup: 'api',
    sidebarGroup: 'apiManagement',
    sidebarText: 'API管理'
  },
  {
    component: 'ApiPlanPage.vue',
    route: '/api/plans',
    mdFile: '/api/plans.md',
    title: 'API套餐',
    navGroup: 'api',
    sidebarGroup: 'apiSelling',
    sidebarText: '套餐管理'
  },
  {
    component: 'DashboardPage.vue',
    route: '/dashboard',
    mdFile: '/dashboard.md',
    title: '仪表盘',
    navGroup: null,
    sidebarGroup: null,
    sidebarText: '仪表盘'
  },
  {
    component: 'StatsPage.vue',
    route: '/stats',
    mdFile: '/stats.md',
    title: '统计分析',
    navGroup: null,
    sidebarGroup: null,
    sidebarText: '统计分析'
  },
  {
    component: 'CreateOrderPage.vue',
    route: '/order/create',
    mdFile: '/order/create.md',
    title: '创建订单',
    navGroup: 'user',
    sidebarGroup: 'userCenter',
    sidebarText: '创建订单'
  }
];

// 集成计划
const integrationPlan = {
  // 1. 创建缺失的目录
  directories: [
    '/order'
  ],
  
  // 2. 创建缺失的Markdown页面
  markdownFiles: missingPages.map(page => ({
    path: page.mdFile,
    title: page.title,
    component: page.component
  })),
  
  // 3. 更新导航配置
  navUpdates: [
    {
      text: '仪表盘',
      link: '/dashboard/'
    },
    {
      text: '统计分析',
      link: '/stats/'
    }
  ],
  
  // 4. 更新侧边栏配置
  sidebarUpdates: {
    '/api/': [
      // 已有的API管理组保持不变
    ],
    '/order/': [
      {
        text: '订单管理',
        items: [
          { text: '订单列表', link: '/user/orders/' },
          { text: '创建订单', link: '/order/create/' }
        ]
      }
    ]
  }
};
