import request from '@/utils/request'

// 获取首页统计数据 (对应 ProjectTaskStatsVO)
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 获取燃尽图数据 (对应 List<BurnDownPointVO>)
export function getBurnDownChart(projectId) {
  return request({
    url: '/dashboard/burn-down',
    method: 'get',
    params: { projectId } // 如果后端支持按项目筛选
  })
}

// 获取项目进度列表 (对应 List<ProjectProgressVO>)
export function getProjectProgress() {
  return request({
    url: '/dashboard/progress',
    method: 'get'
  })
}

// 获取甘特图数据 (对应 List<GanttVO>)
export function getGanttData(projectId) {
  return request({
    url: '/dashboard/gantt',
    method: 'get',
    params: { projectId }
  })
}