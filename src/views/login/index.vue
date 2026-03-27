<template>
  <div class="login-container">
    <!-- 动画背景形状 -->
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>

    <el-card class="box-card glass-card animate-fade-in-up">
      <template #header>
        <div class="card-header">
          <h2 class="title">{{ isLogin ? 'DevTrack 登录' : '注册新账号' }}</h2>
          <p class="subtitle">{{ isLogin ? '欢迎回来，请登录您的账户' : '加入我们，开启高效协作之旅' }}</p>
        </div>
      </template>
      
      <div class="form-wrapper">
        <el-form :model="form" ref="formRef" label-position="top" size="large">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          
          <transition name="expand">
            <div v-if="!isLogin" class="register-fields">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入真实姓名" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="example@domain.com" />
              </el-form-item>
              <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </div>
          </transition>
          
          <el-form-item class="actions">
            <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">
              {{ isLogin ? '立即登录' : '注册账号' }}
            </el-button>
            <div class="switch-mode">
              <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
              <el-button link type="primary" @click="toggleMode">{{ isLogin ? '去注册' : '去登录' }}</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { register } from '@/api/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 登录/注册模式切换
const isLogin = ref(true)
const loading = ref(false)
// 表单数据
const form = reactive({ username: '', password: '', email: '', name: '', phone: '', role: 'USER' })
const userStore = useUserStore()
const router = useRouter()

const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 如果需要可以稍微重置表单字段，或者为了用户体验保留它们
}

/**
 * 提交表单
 */
const onSubmit = async () => {
  loading.value = true
  try {
    if (isLogin.value) {
      // 处理登录
      const success = await userStore.handleLogin(form)
      if (success) {
        ElMessage.success('欢迎回来！')
        router.push('/')
      } else {
        ElMessage.error('登录失败，请检查用户名和密码')
      }
    } else {
      // 处理注册
      await register(form)
      ElMessage.success('注册成功，请登录')
      isLogin.value = true 
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* 背景形状 */
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  animation: float 10s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #667eea;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.shape-2 {
  width: 350px;
  height: 350px;
  background: #764ba2;
  bottom: -80px;
  right: -80px;
  animation-delay: 5s;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(20px) rotate(10deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

.box-card {
  width: 420px;
  z-index: 1;
  border: none;
  background: rgba(255, 255, 255, 0.85); /* 稍微增加不透明度以提高可读性 */
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 700;
}

.subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.switch-mode {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

/* 注册字段的展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  margin-bottom: 0;
}
</style>
