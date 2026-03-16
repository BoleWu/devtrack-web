<template>
    <div class="dashboard-container">
        <!-- Statistic Cards -->
        <el-row :gutter="20" class="row-spacing">
            <el-col :span="6" v-for="(item, index) in statCards" :key="index">
                <el-card shadow="hover" class="stat-card glass-card hover-pulse" :body-style="{ padding: '0px' }" :style="{ animationDelay: `${index * 0.1}s` }">
                    <div class="stat-content">
                        <div class="stat-icon-wrapper" :style="{ background: item.color }">
                            <el-icon class="stat-icon">
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-title">{{ item.title }}</div>
                            <div class="stat-value">
                                <span v-if="loading" class="loading-dots">...</span>
                                <span v-else class="count-up">{{ item.value }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- Charts Row -->
        <el-row :gutter="20" class="row-spacing">
            <el-col :span="16">
                <el-card shadow="hover" class="chart-card glass-card" style="animation-delay: 0.4s">
                    <template #header>
                        <div class="card-header">
                            <span class="header-title">项目燃尽图 (Burn Down Chart)</span>
                            <el-select v-model="selectedProject" placeholder="选择项目" size="small"
                                class="project-select"
                                @change="refreshCharts" @visible-change="(val) => val && loadProjects()">
                                <el-option label="所有项目" :value="null" />
                                <el-option v-for="item in projectOptions" :key="item.id" :label="item.name || item.projectName"
                                    :value="item.id" />
                            </el-select>
                        </div>
                    </template>
                    <div ref="burnDownRef" class="chart-container"></div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="hover" class="chart-card glass-card" style="animation-delay: 0.5s">
                    <template #header>
                        <span class="header-title">项目进度概览</span>
                    </template>
                    <div class="progress-list custom-scrollbar">
                        <div v-for="(proj, idx) in progressList" :key="proj.id" class="progress-item" :style="{ animationDelay: `${0.6 + idx * 0.1}s` }">
                            <div class="progress-header">
                                <span class="project-name">{{ proj.projectName }}</span>
                                <span class="progress-text">{{ proj.completedTasks }}/{{ proj.totalTasks }} 任务</span>
                            </div>
                            <el-progress 
                                :percentage="proj.progress" 
                                :status="getProgressStatus(proj.progress)"
                                :stroke-width="12" 
                                striped 
                                striped-flow 
                            />
                        </div>
                        <el-empty v-if="progressList.length === 0" description="暂无数据" :image-size="100" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- Gantt Chart -->
        <el-row class="row-spacing">
            <el-col :span="24">
                <el-card shadow="hover" class="glass-card" style="animation-delay: 0.6s">
                    <template #header>
                        <span class="header-title">任务甘特图 (Gantt Chart)</span>
                    </template>
                    <div ref="ganttRef" class="gantt-container"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
// 确保这些API路径正确，且对应的后端Controller已启动
import { getDashboardStats, getBurnDownChart, getProjectProgress, getGanttData } from '@/api/dashboard'
import { getProjectList } from '@/api/project' // 引入获取项目列表的API
import { Folder, List, Check, Timer } from '@element-plus/icons-vue'

// --- 状态定义 ---
const loading = ref(false) // 加载状态
const selectedProject = ref(null) // 当前选中的项目ID，null表示所有项目
const projectOptions = ref([]) // 项目下拉选项

// DOM 引用，用于 ECharts 初始化
const burnDownRef = ref(null)
const ganttRef = ref(null)

// ECharts 实例 (不使用 ref 以避免性能问题)
let burnDownChart = null
let ganttChart = null

// 统计卡片数据
const statCards = reactive([
    { title: '总项目数', value: 0, icon: 'Folder', color: 'linear-gradient(135deg, #409EFF 0%, #36d1dc 100%)' },
    { title: '进行中项目', value: 0, icon: 'Timer', color: 'linear-gradient(135deg, #E6A23C 0%, #f7ba2a 100%)' },
    { title: '总任务数', value: 0, icon: 'List', color: 'linear-gradient(135deg, #67C23A 0%, #a4e786 100%)' },
    { title: '已完成任务', value: 0, icon: 'Check', color: 'linear-gradient(135deg, #F56C6C 0%, #ff9a9e 100%)' }
])

const progressList = ref([]) // 项目进度列表数据

// --- 方法 ---

// 获取项目列表（用于下拉框）
const loadProjects = async () => {
    try {
        const res = await getProjectList({ page: 1, limit: 100 })
        projectOptions.value = res.data || []
        
        // 如果当前没有选中项目且列表不为空，默认选中第一个
        if (!selectedProject.value && projectOptions.value.length > 0) {
            selectedProject.value = projectOptions.value[0].id
            // 选中后刷新图表
            refreshCharts()
        }
    } catch (e) {
        console.error("加载项目失败", e)
    }
}

// 获取统计卡片数据
const loadStats = async () => {
    loading.value = true
    try {
        const res = await getDashboardStats()
        if (res) {
            statCards[0].value = res.totalProjects || 0
            statCards[1].value = res.activeProjects || 0
            statCards[2].value = res.totalTasks || 0
            statCards[3].value = res.completedTasks || 0
        }
    } catch (e) {
        console.error("加载统计失败", e)
    } finally {
        loading.value = false
    }
}

// 获取并渲染燃尽图
const loadBurnDownChart = async () => {
    if (!burnDownRef.value) return
    try {
        const res = await getBurnDownChart(selectedProject.value)
        const dates = Array.isArray(res?.dates) ? res.dates : []
        const values = Array.isArray(res?.values) ? res.values : []
        
        // 即使没有数据，也应该初始化图表以显示空坐标轴，或者显示暂无数据
        if (!burnDownChart) {
            burnDownChart = echarts.init(burnDownRef.value)
        }
        
        const option = {
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: dates },
            yAxis: { type: 'value' },
            series: [{
                name: '剩余任务',
                type: 'line',
                smooth: true,
                areaStyle: {
                    opacity: 0.3,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#409EFF' },
                        { offset: 1, color: '#fff' }
                    ])
                },
                itemStyle: { color: '#409EFF' },
                data: values
            }]
        }
        burnDownChart.setOption(option)
    } catch (e) {
        console.error("加载燃尽图失败", e)
    }
}

// 获取项目进度列表
const loadProgress = async () => {
    try {
        const res = await getProjectProgress()
        progressList.value = Array.isArray(res) ? res : []
    } catch (e) {
        console.error("加载进度失败", e)
    }
}

// 获取并渲染甘特图
const loadGanttChart = async () => {
    if (!ganttRef.value) return
    try {
        const res = await getGanttData(selectedProject.value)
        const list = Array.isArray(res) ? res : []
        
        const tasks = list.map(t => t.name)
        const startTimes = list.map(t => t.start)
        const durations = list.map(t => t.duration)

        if (!ganttChart) {
            ganttChart = echarts.init(ganttRef.value)
        }

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', name: '天数' },
            yAxis: { type: 'category', data: tasks },
            series: [
                {
                    name: '开始时间',
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: 'transparent', borderColor: 'transparent' },
                    emphasis: { itemStyle: { color: 'transparent', borderColor: 'transparent' } },
                    data: startTimes
                },
                {
                    name: '持续时间',
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: '#67C23A', borderRadius: [0, 4, 4, 0] },
                    data: durations
                }
            ]
        }
        ganttChart.setOption(option)
    } catch (e) {
        console.error("加载甘特图失败", e)
    }
}

// 刷新所有图表 (当筛选条件变化时)
const refreshCharts = () => {
    loadBurnDownChart()
    loadGanttChart()
    loadProgress() // 进度通常是所有项目的，但也可能受筛选影响，视业务而定
}

// 辅助方法：进度条颜色状态
const getProgressStatus = (percent) => {
    if (percent === 100) return 'success'
    if (percent > 80) return 'warning'
    return ''
}

// 窗口大小变化时重绘图表
const handleResize = () => {
    burnDownChart?.resize()
    ganttChart?.resize()
}

onMounted(async () => {
    await nextTick()
    loadStats()
    loadProjects()
    loadProgress()
    loadBurnDownChart()
    loadGanttChart()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    burnDownChart?.dispose()
    ganttChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
}

.row-spacing {
    margin-bottom: 20px;
}

.stat-card {
    border-radius: 12px;
    border: none;
    animation: fadeInUp 0.5s ease-out forwards;
    /* Removed initial hidden state to prevent layout jumps if animation fails, 
       but keeping animation. Keyframes should handle the 'from' state. */
}

.stat-content {
    display: flex;
    align-items: center;
    padding: 20px; /* Increased padding */
}

.stat-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.stat-icon {
    font-size: 28px;
    color: #fff;
}

.stat-info {
    flex: 1;
    overflow: hidden; /* Prevent text overflow */
}

.stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    line-height: 1;
}

.chart-card {
    border-radius: 12px;
    border: none;
    animation: fadeInUp 0.5s ease-out forwards;
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* Allow wrapping on small screens */
    gap: 10px;
}

.header-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.project-select {
    width: 180px; /* Fixed width for consistency */
}

.chart-container, .gantt-container {
    height: 350px;
    width: 100%;
    min-height: 350px; /* Ensure height */
}

.gantt-container {
    height: 450px; /* Increased height for Gantt */
    min-height: 450px;
}

.progress-list {
    height: 350px; /* Fixed height instead of max-height for alignment */
    overflow-y: auto;
    padding-right: 10px;
}

.progress-item {
    margin-bottom: 20px;
    animation: fadeInUp 0.5s ease-out forwards;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.project-name {
    font-weight: 500;
    color: #606266;
}

.progress-text {
    color: #909399;
    font-size: 12px;
}

/* Custom Scrollbar for progress list */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
}
</style>
