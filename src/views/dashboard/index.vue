<template>
    <div class="dashboard-container">
        <el-row :gutter="20" class="mb-4">
            <el-col :span="6" v-for="(item, index) in statCards" :key="index">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-icon" :style="{ background: item.color }">
                        <component :is="item.icon" />
                    </div>
                    <div class="stat-info">
                        <div class="stat-title">{{ item.title }}</div>
                        <div class="stat-value">
                            <span v-if="loading">...</span>
                            <span v-else>{{ item.value }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4">
            <el-col :span="16">
                <el-card shadow="hover" class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>项目燃尽图 (Burn Down Chart)</span>
                            <el-select v-model="selectedProject" placeholder="选择项目" size="small"
                                @change="refreshCharts">
                                <el-option label="所有项目" :value="null" />
                                <el-option v-for="item in projectOptions" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select>
                        </div>
                    </template>
                    <div ref="burnDownRef" style="height: 350px; width: 100%;"></div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="hover" class="chart-card">
                    <template #header>
                        <span>项目进度概览</span>
                    </template>
                    <div class="progress-list">
                        <div v-for="proj in progressList" :key="proj.id" class="progress-item">
                            <div class="progress-label">
                                <span>{{ proj.projectName }}</span>
                                <span class="progress-text">{{ proj.completedTasks }}/{{ proj.totalTasks }} 任务</span>
                            </div>
                            <el-progress :percentage="proj.progress" :status="getProgressStatus(proj.progress)"
                                :stroke-width="10" />
                        </div>
                        <el-empty v-if="progressList.length === 0" description="暂无数据" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24">
                <el-card shadow="hover">
                    <template #header>
                        <span>任务甘特图 (Gantt Chart)</span>
                    </template>
                    <div ref="ganttRef" style="height: 400px; width: 100%;"></div>
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
const loading = ref(false)
const selectedProject = ref(null)
const projectOptions = ref([])

// DOM 引用
const burnDownRef = ref(null)
const ganttRef = ref(null)

// ECharts 实例 (不使用 ref 以避免性能问题)
let burnDownChart = null
let ganttChart = null

// 统计数据
const statCards = reactive([
    { title: '总项目数', value: 0, icon: 'Folder', color: '#409EFF' },
    { title: '进行中项目', value: 0, icon: 'Timer', color: '#E6A23C' },
    { title: '总任务数', value: 0, icon: 'List', color: '#67C23A' },
    { title: '已完成任务', value: 0, icon: 'Check', color: '#F56C6C' }
])

const progressList = ref([])

// --- 初始化与加载 ---
onMounted(async () => {
    window.addEventListener('resize', handleResize)
    await loadProjects() // 先加载项目列表供下拉框使用
    await loadData()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (burnDownChart) burnDownChart.dispose()
    if (ganttChart) ganttChart.dispose()
})

const loadProjects = async () => {
    try {
        const res = await getProjectList()
        projectOptions.value = res || []
    } catch (e) {
        console.error("加载项目列表失败", e)
    }
}

const loadData = async () => {
    loading.value = true
    try {
        // 1. 获取统计卡片数据
        const statRes = await getDashboardStats()
        if (statRes) {
            statCards[0].value = statRes.totalProjects
            statCards[1].value = statRes.activeProjects
            statCards[2].value = statRes.totalTasks
            statCards[3].value = statRes.completedTasks
        }

        // 2. 获取进度列表
        const progRes = await getProjectProgress()
        progressList.value = progRes || []

        // 3. 渲染图表
        await refreshCharts()
    } catch (error) {
        console.error("加载仪表盘数据失败", error)
    } finally {
        loading.value = false
    }
}

const refreshCharts = async () => {
    // 使用 nextTick 确保 DOM 已经更新
    await nextTick()
    await initBurnDownChart()
    await initGanttChart()
}

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        // 解决 Safari/Firefox 不支持 "yyyy-MM-dd HH:mm:ss" 的问题
        // 将空格替换为 T (标准 ISO 格式)
        const stdStr = dateStr.replace(' ', 'T');
        const date = new Date(stdStr);
        if (isNaN(date.getTime())) return null;
        return date.getTime();
    } catch (e) {
        return null;
    }
}

const renderGanttItem = (params, api) => {
    // 取得数据索引
    const categoryIndex = api.value(0); // Y轴索引 (任务名称)
    const timeStart = api.value(1);     // 开始时间
    const timeEnd = api.value(2);       // 结束时间

    // 计算屏幕坐标
    const start = api.coord([timeStart, categoryIndex]);
    const end = api.coord([timeEnd, categoryIndex]);
    
    // 计算矩形高度 (barHeight)
    // api.size([0, 1])[1] 获取Y轴一个类目的高度，我们取 60% 作为条形高度
    const height = api.size([0, 1])[1] * 0.6;
    
    // 生成矩形形状
    const rectShape = echarts.graphic.clipRectByRect({
        x: start[0],
        y: start[1] - height / 2, // 垂直居中
        width: end[0] - start[0],
        height: height
    }, {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
    });

    return rectShape && {
        type: 'rect',
        transition: ['shape'],
        shape: rectShape,
        style: api.style() // 使用 data 中定义的 itemStyle
    };
}

// --- 图表逻辑：燃尽图 ---
const initBurnDownChart = async () => {
    if (!burnDownRef.value) return
    if (!burnDownChart) burnDownChart = echarts.init(burnDownRef.value)

    try {
        const data = await getBurnDownChart(selectedProject.value) || []
        const dates = data.map(item => item.day)
        const values = data.map(item => item.remain)

        const option = {
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: dates },
            yAxis: { type: 'value', name: '剩余任务' },
            series: [
                {
                    name: '剩余任务',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: { opacity: 0.1 },
                    smooth: true,
                    data: values,
                    itemStyle: { color: '#409EFF' }
                }
            ]
        }
        burnDownChart.setOption(option)
    } catch (e) {
        console.error("渲染燃尽图失败", e)
    }
}

// 获取任务状态对应的颜色
const getStatusColor = (status) => {
    if (!status) return '#409EFF'; // 默认蓝色
    const map = {
        'TODO': '#909399',       // 待办 - 灰色
        'PLANNED': '#909399',
        'DOING': '#409EFF',      // 进行中 - 蓝色
        'IN_PROGRESS': '#409EFF',
        'DONE': '#67C23A',       // 已完成 - 绿色
        'COMPLETED': '#67C23A',
        'success': '#67C23A'
    }
    return map[status] || '#409EFF';
}

// --- 关键修复：甘特图逻辑 ---
// --- 图表逻辑：甘特图 (修复版) ---
// --- 图表逻辑：甘特图 (Custom Series 终极版) ---
const initGanttChart = async () => {
    // 1. 容器检查
    if (!ganttRef.value) return;
    await nextTick();
    if (!ganttChart) {
        ganttChart = echarts.init(ganttRef.value);
    }

    // 2. 获取数据
    const rawData = await getGanttData(selectedProject.value) || [];
    
    // 3. 数据预处理
    const taskNames = [];
    const chartData = [];
    let minTime = Number.MAX_VALUE;
    let maxTime = Number.MIN_VALUE;

    rawData.forEach((item, index) => {
        const name = item.name || item.taskName || `任务-${index}`;
        const startTime = parseDate(item.start || item.startTime);
        const endTime = parseDate(item.end || item.endTime);
        const status = item.status || 'TODO';

        // 过滤无效时间数据
        if (!startTime) return;
        
        // 如果没有结束时间，默认给 1 天时长，避免渲染失败
        const finalEndTime = endTime || (startTime + 3600 * 1000 * 24);

        // 记录时间范围用于设置坐标轴
        if (startTime < minTime) minTime = startTime;
        if (finalEndTime > maxTime) maxTime = finalEndTime;

        taskNames.push(name);
        
        // 构建 Custom Series 需要的数据格式
        // value 数组含义: [Y轴索引, 开始时间, 结束时间, 持续时长]
        chartData.push({
            name: name,
            value: [
                index,           // 0: Y轴索引 (对应 taskNames)
                startTime,       // 1: 开始时间
                finalEndTime,    // 2: 结束时间
                finalEndTime - startTime // 3: 时长
            ],
            itemStyle: {
                color: getStatusColor(status),
                borderRadius: 4
            },
            // 保存原始数据供 Tooltip 使用
            origin: { status, startTime, endTime: finalEndTime } 
        });
    });

    // 空数据处理
    if (chartData.length === 0) {
        ganttChart.clear();
        ganttChart.setOption({ 
            title: { text: '暂无任务数据', left: 'center', top: 'center' } 
        });
        return;
    }

    // 4. 动态计算 X 轴边距 (前后各留 5% 空间)
    const timeMargin = (maxTime - minTime) * 0.05;

    // 5. 配置 Option
    const option = {
        title: {
            text: `项目任务进度 (${chartData.length} 个任务)`,
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'item', // Custom Series 必须用 item trigger
            formatter: function (params) {
                const data = params.data;
                const origin = data.origin;
                const sDate = new Date(data.value[1]).toLocaleDateString() + ' ' + new Date(data.value[1]).toLocaleTimeString();
                const eDate = new Date(data.value[2]).toLocaleDateString();
                const durationDays = (data.value[3] / (1000 * 60 * 60 * 24)).toFixed(1);
                
                return `
                    <div style="font-weight:bold; margin-bottom:5px;">${data.name}</div>
                    <div style="font-size:12px">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color};margin-right:5px;"></span>
                        状态: ${origin.status}
                    </div>
                    <div style="font-size:12px; margin-top:3px;">开始: ${sDate}</div>
                    <div style="font-size:12px">结束: ${eDate}</div>
                    <div style="font-size:12px">时长: ${durationDays} 天</div>
                `;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'time',
            min: minTime - timeMargin,
            max: maxTime + timeMargin,
            axisLabel: {
                formatter: '{yyyy}-{MM}-{dd}'
            },
            splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        yAxis: {
            type: 'category',
            data: taskNames,
            axisLabel: {
                interval: 0, // 强制显示所有标签
                width: 100,
                overflow: 'truncate'
            },
            splitLine: { show: true, lineStyle: { color: '#eee' } }
        },
        series: [
            {
                type: 'custom',
                renderItem: renderGanttItem, // 调用上面定义的渲染函数
                itemStyle: {
                    opacity: 0.8
                },
                encode: {
                    x: [1, 2], // 将 value[1] 和 value[2] 映射到 X 轴 (用于缩放等)
                    y: 0       // 将 value[0] 映射到 Y 轴
                },
                data: chartData
            }
        ]
    };

    ganttChart.setOption(option, true);
    
    // 强制重绘一次，解决某些情况下的渲染延迟
    setTimeout(() => {
        ganttChart.resize();
    }, 200);
}

const handleResize = () => {
    burnDownChart?.resize()
    ganttChart?.resize()
}

const getProgressStatus = (percentage) => {
    if (percentage === 100) return 'success'
    if (percentage < 50) return 'exception'
    return ''
}
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 84px);
}

.mb-4 {
    margin-bottom: 20px;
}

/* 统计卡片样式 */
.stat-card {
    display: flex;
    align-items: center;
    border: none;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 16px;
    color: white;
    font-size: 24px;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
}

.chart-card {
    height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 进度列表样式 */
.progress-list {
    height: 350px;
    overflow-y: auto;
    padding-right: 10px;
}

.progress-item {
    margin-bottom: 20px;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 14px;
    color: #606266;
}

.progress-text {
    color: #909399;
    font-size: 12px;
}
</style>