/**
 * 语言切换器组件 - 可在任何页面独立使用
 */
<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

// 国际化
const { t } = useI18n();

// 获取全局提供的语言切换方法和当前语言
const toggleLocale = inject('toggleLocale');
const currentLocale = inject('currentLocale', ref('zh-CN'));

// 语言选项
const languages = [
  { value: 'zh-CN', label: t('language.simplified_chinese') },
  { value: 'en', label: t('language.english') }
];

// 切换语言
const changeLanguage = (lang) => {
  if (toggleLocale && lang !== currentLocale.value) {
    toggleLocale(lang);
    ElMessage.success(t('common.languageChanged'));
  }
};
</script>

<template>
  <div class="language-switcher">
    <el-dropdown @command="changeLanguage" trigger="click">
      <span class="language-dropdown">
        {{ currentLocale === 'zh-CN' ? t('language.simplified_chinese') : t('language.english') }}
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="lang in languages"
            :key="lang.value"
            :command="lang.value"
            :disabled="currentLocale === lang.value"
          >
            {{ lang.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}
</style>
