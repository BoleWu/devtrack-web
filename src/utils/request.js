import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const service = axios.create({
    baseURL: '/api', // 走 Vite 代理
    timeout: 5000
})

// 请求拦截器：自动携带 Token
service.interceptors.request.use(
    config => {
        // 优先从 localStorage 获取 token（最可靠）
        const token = localStorage.getItem('token')
        if (token) {
            // 对应后端 AuthenticationInterceptor 检测 "Bearer "
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：处理 R.java 的返回结构
service.interceptors.response.use(
    response => {
        const res = response.data
        // 后端返回 code 0 代表成功
        if (res.code !== 0) {
            ElMessage.error(res.message || 'Error')

            // 处理 Token 过期或未登录
            if (res.code === 401) {
                const userStore = useUserStore()
                userStore.logout()
                router.push('/login')
            }
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res.responseBody
        }
    },
    error => {
        ElMessage.error(error.response?.data?.message || '网络错误')
        return Promise.reject(error)
    }
)

export default service