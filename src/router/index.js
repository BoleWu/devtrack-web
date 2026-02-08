import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import Login from '@/views/login/index.vue'
import { useUserStore } from '@/stores/user'

/**
 * 路由配置
 * 定义应用的页面结构
 */
const routes = [
  { 
    path: '/login', 
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout, // 使用布局组件作为父级
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'), // 路由懒加载
        meta: { title: '仪表盘' }
      },
      {
        path: 'projects',
        component: () => import('@/views/project/index.vue'),
        meta: { title: '项目管理' }
      },
      {
        path: 'tasks',
        component: () => import('@/views/task/index.vue'),
        meta: { title: '任务管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 直接检查 localStorage，避免 Pinia store 初始化时序问题
  const token = localStorage.getItem('token')
  
  // 如果未登录且访问非登录页，强制跳转到登录页
  if (to.path !== '/login' && (!token || token === '')) {
    next('/login')
  } else {
    next()
  }
})

export default router