import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
const originalWarn = console.warn;
console.warn = function (...args) {
  if (args[0] && args[0].includes('Invalid prop: type check failed for prop "value"')) {
    // 忽略这个特定警告，避免影响渲染
    return;
  }
  originalWarn.apply(console, args);
};
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')