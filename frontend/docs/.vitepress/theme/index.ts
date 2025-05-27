// .vitepress/theme/index.ts
import { h, ref, provide, watch } from 'vue';
import DefaultTheme from 'vitepress/theme';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import en from 'element-plus/dist/locale/en.mjs';

// 导入自定义样式
import './styles/custom.css';
import 'element-plus/dist/index.css';

// 导入语言包
import messages from '../i18n';

// 获取本地存储的语言设置或使用默认值
const getStoredLocale = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('locale') || 'zh-CN';
  }
  return 'zh-CN';
};

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: getStoredLocale(), // 从本地存储获取语言设置
  fallbackLocale: 'en', // 回退语言
  messages, // 语言包
});

// 获取Element Plus对应的语言包
const getElementLocale = (locale) => {
  return locale === 'zh-CN' ? zhCn : en;
};

// 导出自定义主题
export default {
  ...DefaultTheme,
  setup() {
    // 创建响应式的当前语言
    const currentLocale = ref(getStoredLocale());
    
    // 创建响应式的Element Plus语言包
    const elementLocale = ref(getElementLocale(currentLocale.value));
    
    // 提供全局的语言切换方法
    const toggleLocale = (locale) => {
      // 更新i18n语言
      i18n.global.locale.value = locale;
      
      // 更新当前语言
      currentLocale.value = locale;
      
      // 更新Element Plus语言包
      elementLocale.value = getElementLocale(locale);
      
      // 保存到本地存储
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('locale', locale);
      }
    };
    
    // 提供全局的语言和切换方法
    provide('currentLocale', currentLocale);
    provide('elementLocale', elementLocale);
    provide('toggleLocale', toggleLocale);
    
    // 返回默认主题的setup结果
    const defaultThemeSetup = DefaultTheme.setup?.() || {};
    return {
      ...defaultThemeSetup
    };
  },
  enhanceApp({ app }) {
    // 注册Element Plus
    app.use(ElementPlus, {
      locale: getElementLocale(getStoredLocale()), // 根据当前语言设置Element Plus语言
    });
    
    // 注册i18n
    app.use(i18n);
  }
};
