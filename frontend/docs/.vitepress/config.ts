import { defineConfig } from 'vitepress';

// 定义环境变量，解决vue-i18n构建问题
if (typeof window === 'undefined') {
  global.__VUE_PROD_DEVTOOLS__ = false;
}

export default defineConfig({
  lang: 'zh-CN',
  title: '接口管理平台',
  description: '功能强大的API接口管理平台',
  
  // 主题配置
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: 'API文档', link: '/api/' },
      { text: '我的团队', link: '/team/' },
      { text: '用户中心', link: '/user/' }
    ],
    
    sidebar: {
      '/api/': [
        {
          text: 'API管理',
          items: [
            { text: 'API概览', link: '/api/' },
            { text: 'API详情', link: '/api/detail' },
            { text: '版本管理', link: '/api/versions' },
            { text: '权限管理', link: '/api/permissions' }
          ]
        },
        {
          text: 'API套餐',
          items: [
            { text: '套餐管理', link: '/api/plans' },
            { text: '套餐购买', link: '/api/purchase' }
          ]
        }
      ],
      '/team/': [
        {
          text: '我的团队',
          items: [
            { text: '团队管理', link: '/team/' }
          ]
        }
      ],
      '/user/': [
        {
          text: '用户中心',
          items: [
            { text: '个人资料', link: '/user/' },
            { text: '我的API', link: '/user/apis' },
            { text: '我的订单', link: '/user/orders' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/api-management-platform' }
    ],
    
    // 页脚
    footer: {
      message: '基于MIT许可发布',
      copyright: '© 2025 接口管理平台'
    }
  }
});
