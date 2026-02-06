import { defineStore } from 'pinia'
import { login, register } from '@/api/auth'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // 验证本地存储的令牌是否有效
    const storedToken = localStorage.getItem('token')
    const token = ref(storedToken && storedToken !== 'undefined' ? storedToken : '')
    const storedUserInfo = localStorage.getItem('userInfo')
    let initialUserInfo = { username: '' }
    if (storedUserInfo && storedUserInfo !== 'undefined') {
        try {
            const parsed = JSON.parse(storedUserInfo)
            if (parsed && typeof parsed === 'object') initialUserInfo = parsed
        } catch (_) {}
    }
    const userInfo = ref(initialUserInfo)

    const handleLogin = async (loginForm) => {
        try {
            const data = await login(loginForm) // 对应 LoginVO
            token.value = data.token
            userInfo.value = { username: data.username, id: data.userId } // 假设 LoginVO 返回了 userId
            localStorage.setItem('token', data.token)
            localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
            return true
        } catch (error) {
            return false
        }
    }

    const logout = () => {
        token.value = ''
        userInfo.value = { username: '' }
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    return { token, userInfo, handleLogin, logout }
})
