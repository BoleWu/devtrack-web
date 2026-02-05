import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import Login from '@/views/login/index.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'projects',
        component: () => import('@/views/project/index.vue'),
        meta: { title: '项目管理' }
      }
      // 可以继续添加 Task 等路由
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 直接检查 localStorage，避免 Pinia store 同步问题
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && (!token || token === '')) {
    next('/login')
  } else {
    next()
  }
})

export default router