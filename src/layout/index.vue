<template>
    <el-container class="layout-container">
        <el-aside width="200px">
            <el-menu router :default-active="$route.path" class="el-menu-vertical">
                <el-menu-item index="/dashboard">
                    <el-icon>
                        <Odometer />
                    </el-icon>
                    <span>仪表盘</span>
                </el-menu-item>
                <el-menu-item index="/projects">
                    <el-icon>
                        <Folder />
                    </el-icon>
                    <span>项目管理</span>
                </el-menu-item>
                <el-menu-item index="/tasks">
                    <el-icon>
                        <List />
                    </el-icon>
                    <span>任务看板</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header style="text-align: right; font-size: 12px">
                <el-dropdown>
                    <span class="el-dropdown-link">
                        {{ userStore.userInfo?.username || '未登录' }}
                        <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { Odometer, Folder, ArrowDown } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
    userStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.layout-container {
    height: 100vh;
    overflow: hidden;
}

.el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    line-height: 60px;
}

.el-aside {
    background-color: #304156;
    color: #fff;
}

.el-menu {
    border-right: none;
}
</style>