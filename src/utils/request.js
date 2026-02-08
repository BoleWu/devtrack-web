import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
    baseURL: '/api', // 使用 Vite 代理转发到后端
    timeout: 5000    // 请求超时时间
})

// 错误消息去重集合
const errorMsgSet = new Set()

/**
 * 显示唯一的错误消息（2秒内不重复显示同一条）
 */
const showUniqueError = (message) => {
    if (errorMsgSet.has(message)) return
    
    errorMsgSet.add(message)
    ElMessage.error({
        message,
        grouping: true
    })
    
    setTimeout(() => {
        errorMsgSet.delete(message)
    }, 2000)
}

// 请求拦截器：在请求发送前统一处理
service.interceptors.request.use(
    config => {
        // 优先从 localStorage 获取 token（最可靠）
        const token = localStorage.getItem('token')
        const normalizedToken = typeof token === 'string' ? token.trim() : ''
        
        // 如果 Token 存在且有效，添加到请求头 Authorization 中
        if (normalizedToken && normalizedToken !== 'undefined' && normalizedToken !== 'null') {
            // 对应后端 AuthenticationInterceptor 检测 "Bearer " 前缀
            config.headers['Authorization'] = 'Bearer ' + normalizedToken
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：统一处理后端返回结果
service.interceptors.response.use(
    response => {
        const res = response.data
        
        // 防御性检查：确保返回的是对象
        if (!res || typeof res !== 'object') {
            const message = typeof res === 'string' ? res : '服务返回异常'
            showUniqueError(message)
            // 如果返回包含权限相关的字符串，强制登出
            if (typeof res === 'string' && /access denied|unauthorized|token/i.test(res)) {
                handleUnauthorized()
            }
            return Promise.reject(new Error(message))
        }

        // 业务逻辑判断：code === 0 代表成功
        if (res.code !== 0) {
            // 优先显示 responseBody 中的错误信息（如果是字符串），否则使用 message
            const errMsg = (typeof res.responseBody === 'string' && res.responseBody) 
                ? res.responseBody 
                : (res.message || 'Error')
            
            showUniqueError(errMsg)

            // 处理 Token 过期或未登录 (401/403)
            if (res.code === 401 || res.code === 403 || /invalid token|access denied|unauthorized|token/i.test(res.message || '')) {
                handleUnauthorized()
            }
            return Promise.reject(new Error(errMsg))
        } else {
            // 只返回业务数据部分 (responseBody)
            return res.responseBody
        }
    },
    error => {
        // 网络或其他层面错误
        const status = error.response?.status
        const msg = error.response?.data?.message || '网络错误'
        
        if (status === 401) {
            handleUnauthorized()
        } else {
            showUniqueError(msg)
        }
        
        return Promise.reject(error)
    }
)

/**
 * 处理未授权/Token过期的情况
 */
function handleUnauthorized() {
    const userStore = useUserStore()
    userStore.logout()
    // 清除所有浏览器缓存
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
    showUniqueError('登录已过期，请重新登录')
}

export default service
