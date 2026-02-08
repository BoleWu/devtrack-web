import { defineStore } from 'pinia'
import { login, register } from '@/api/auth'
import { ref } from 'vue'

/**
 * 用户状态管理 Store
 * 处理登录、登出及用户信息存储
 */
export const useUserStore = defineStore('user', () => {
    // 初始化时尝试从 localStorage 恢复 Token
    const storedToken = localStorage.getItem('token')
    const token = ref(storedToken && storedToken !== 'undefined' ? storedToken : '')
    
    // 初始化时尝试从 localStorage 恢复用户信息
    const storedUserInfo = localStorage.getItem('userInfo')
    let initialUserInfo = { username: '' }
    if (storedUserInfo && storedUserInfo !== 'undefined') {
        try {
            const parsed = JSON.parse(storedUserInfo)
            if (parsed && typeof parsed === 'object') initialUserInfo = parsed
        } catch (_) {}
    }
    const userInfo = ref(initialUserInfo)

    /**
     * 处理登录逻辑
     * @param {Object} loginForm - 登录表单数据
     * @returns {boolean} - 登录是否成功
     */
    const handleLogin = async (loginForm) => {
        try {
            const data = await login(loginForm) // 调用后端登录 API
            token.value = data.token
            userInfo.value = { username: data.username, id: data.userId }
            
            // 持久化存储
            localStorage.setItem('token', data.token)
            localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 登出逻辑
     * 清除状态和本地存储
     */
    const logout = () => {
        token.value = ''
        userInfo.value = { username: '' }
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    return { token, userInfo, handleLogin, logout }
})
