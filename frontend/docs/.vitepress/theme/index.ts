// .vitepress/theme/index.ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import { createI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

// 导入自定义样式
import './styles/custom.css'
import 'element-plus/dist/index.css'

// 导入语言包
import messages from '../i18n'

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages, // 语言包
})

// 导出自定义主题
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册Element Plus
    app.use(ElementPlus, {
      locale: zhCn, // 默认使用中文
    })
    
    // 注册i18n
    app.use(i18n)
  }
}
