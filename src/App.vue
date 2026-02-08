<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 自定义中文语言包，覆盖分页组件的文本
const locale = {
  ...zhCn,
  el: {
    ...zhCn.el,
    pagination: {
      ...zhCn.el.pagination,
      total: '总条数 {total}',
      goto: '跳转到',
      pagesize: '/每页',
      pageClassifier: '页'
    }
  }
}
</script>

<template>
  <el-config-provider :locale="locale">
    <!-- 根路由视图，所有页面内容将在此渲染 -->
    <router-view />
  </el-config-provider>
</template>

<style scoped>
/* 应用级别的样式，Logo 动画效果 */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
