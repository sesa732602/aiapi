/**
 * 配置文件 - 支持国际化
 */
import { defineConfig } from 'vitepress';
import { createI18n } from 'vue-i18n';
import messages from './i18n';

// 获取本地存储的语言设置或使用默认值
const getStoredLocale = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('locale') || 'zh-CN';
  }
  return 'zh-CN';
};

// 当前语言
const currentLocale = getStoredLocale();

// 定义环境变量，解决vue-i18n构建问题
if (typeof window === 'undefined') {
  global.__VUE_PROD_DEVTOOLS__ = false;
}

// 创建i18n实例用于配置文件
const i18n = createI18n({
  legacy: false,
  locale: currentLocale,
  fallbackLocale: 'en',
  messages,
});

// 获取翻译函数
const t = (key) => {
  return i18n.global.t(key);
};

export default defineConfig({
  lang: currentLocale,
  title: currentLocale === 'zh-CN' ? '接口管理平台' : 'API Management Platform',
  description: currentLocale === 'zh-CN' ? '功能强大的API接口管理平台' : 'A powerful API management solution',
  
  // 主题配置
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: t('nav.home'), link: '/' },
      { text: t('nav.apiDocs'), link: '/api/' },
      { text: t('nav.myTeam'), link: '/team/' },
      { text: t('nav.userCenter'), link: '/user/' }
    ],
    
    sidebar: {
      '/api/': [
        {
          text: t('sidebar.apiManagement'),
          items: [
            { text: t('sidebar.apiOverview'), link: '/api/' },
            { text: t('sidebar.apiDetail'), link: '/api/detail' },
            { text: t('sidebar.apiVersions'), link: '/api/versions' },
            { text: t('sidebar.apiPermissions'), link: '/api/permissions' }
          ]
        },
        {
          text: t('sidebar.apiSelling'),
          items: [
            { text: t('sidebar.apiPlans'), link: '/api/plans' },
            { text: t('sidebar.apiPurchase'), link: '/api/purchase' }
          ]
        }
      ],
      '/team/': [
        {
          text: t('nav.myTeam'),
          items: [
            { text: t('team.management'), link: '/team/' }
          ]
        }
      ],
      '/user/': [
        {
          text: t('sidebar.userCenter'),
          items: [
            { text: t('sidebar.profile'), link: '/user/' },
            { text: t('sidebar.myApis'), link: '/user/apis' },
            { text: t('sidebar.myOrders'), link: '/user/orders' }
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
      message: t('app.license'),
      copyright: t('app.footerCopyright')
    }
  }
});
