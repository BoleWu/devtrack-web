import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
// 导入所有 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册所有 Element Plus 图标为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 拦截并忽略特定的控制台警告（如 prop 类型检查警告），避免干扰开发
const originalWarn = console.warn;
console.warn = function (...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Invalid prop: type check failed for prop "value"')) {
    // 忽略这个特定警告，避免影响渲染
    return;
  }
  originalWarn.apply(console, args);
};

// 安装插件
app.use(createPinia()) // 状态管理
app.use(router)        // 路由
app.use(ElementPlus)   // UI 组件库

app.mount('#app')