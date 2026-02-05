import { defineStore } from 'pinia'
import { login, register } from '@/api/auth'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

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
        userInfo.value = {}
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    return { token, userInfo, handleLogin, logout }
})