<template>
    <el-container class="layout-container">
        <el-aside width="240px" class="aside-menu">
            <div class="logo-container">
                <img src="@/assets/vue.svg" alt="Logo" class="logo" />
                <span class="app-name">DevTrack</span>
            </div>
            <el-menu
                router
                :default-active="$route.path"
                class="el-menu-vertical"
                background-color="transparent"
                text-color="#bfcbd9"
                active-text-color="#ffffff"
            >
                <el-menu-item index="/dashboard">
                    <el-icon><Odometer /></el-icon>
                    <span>仪表盘</span>
                </el-menu-item>
                <el-menu-item index="/projects">
                    <el-icon><Folder /></el-icon>
                    <span>项目管理</span>
                </el-menu-item>
                <el-menu-item index="/tasks">
                    <el-icon><List /></el-icon>
                    <span>任务看板</span>
                </el-menu-item>
                <el-menu-item index="/users">
                    <el-icon><User /></el-icon>
                    <span>用户管理</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        
        <el-container class="main-container">
            <el-header class="glass-header">
                <div class="header-left">
                    <!-- Breadcrumb or Title could go here -->
                    <span class="page-title">{{ $route.meta.title || 'DevTrack' }}</span>
                </div>
                <el-dropdown trigger="click">
                    <div class="user-info hover-pulse">
                        <el-avatar :size="32" class="user-avatar">{{ userStore.userInfo?.username?.charAt(0)?.toUpperCase() }}</el-avatar>
                        <span class="username">{{ userStore.userInfo?.username || '未登录' }}</span>
                        <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="custom-dropdown">
                            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            
            <el-main>
                <router-view v-slot="{ Component }">
                    <transition name="page" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { Odometer, Folder, ArrowDown, List, User } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

/**
 * 退出登录
 */
const logout = () => {
    userStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.layout-container {
    height: 100vh;
    display: flex;
}

.aside-menu {
    background: #304156; /* Fallback */
    background: linear-gradient(180deg, #304156 0%, #1f2d3d 100%);
    color: #fff;
    transition: width 0.3s;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
    z-index: 10;
    display: flex;
    flex-direction: column;
}

.logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.1);
}

.logo {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    animation: spin 20s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.app-name {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

.el-menu {
    border-right: none;
    margin-top: 10px;
}

.el-menu-item {
    margin: 4px 10px;
    border-radius: 8px;
    height: 50px;
    line-height: 50px;
}

.el-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-menu-item.is-active {
    background: linear-gradient(90deg, #409EFF 0%, #36d1dc 100%);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    font-weight: 600;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #f0f2f5;
    position: relative;
}

/* Glass Header */
.glass-header {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    z-index: 9;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 20px;
    transition: background 0.3s;
}

.user-info:hover {
    background: rgba(0, 0, 0, 0.05);
}

.user-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin-right: 8px;
    font-size: 14px;
    color: #fff;
}

.username {
    font-size: 14px;
    color: #606266;
    margin-right: 5px;
}

.el-main {
    padding: 20px;
    overflow-y: auto;
}

/* Page Transition */
.page-enter-active,
.page-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.page-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
