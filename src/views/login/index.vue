<template>
  <div class="login-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isLogin ? 'DevTrack 登录' : '注册新账号' }}</span>
        </div>
      </template>
      
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ isLogin ? '登录' : '注册' }}</el-button>
          <el-button link @click="isLogin = !isLogin">{{ isLogin ? '去注册' : '去登录' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { register } from '@/api/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const isLogin = ref(true)
const form = reactive({ username: '', password: '', email: '', role: 'USER' })
const userStore = useUserStore()
const router = useRouter()

const onSubmit = async () => {
  if (isLogin.value) {
    const success = await userStore.handleLogin(form)
    if (success) router.push('/')
  } else {
    try {
      await register(form)
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
    } catch (e) {
      // 错误由拦截器处理
    }
  }
}
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }
.box-card { width: 400px; }
</style>