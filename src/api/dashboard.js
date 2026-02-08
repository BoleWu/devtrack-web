import request from '@/utils/request'

/**
 * 获取首页统计数据 (对应 ProjectTaskStatsVO)
 * 包括：项目总数、进行中项目、任务总数、已完成任务
 * @returns {Promise}
 */
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取燃尽图数据 (对应 List<BurnDownPointVO>)
 * @param {number|null} id - 项目ID，可选。若为空则查询所有项目
 * @returns {Promise}
 */
export function getBurnDownChart(id) {
  const params = {}
  if (id) params.id = id
  return request({
    url: '/dashboard/burn-down',
    method: 'get',
    params
  })
}

/**
 * 获取项目进度列表 (对应 List<ProjectProgressVO>)
 * 展示每个项目的完成度
 * @returns {Promise}
 */
export function getProjectProgress() {
  return request({
    url: '/dashboard/progress',
    method: 'get'
  })
}

/**
 * 获取甘特图数据 (对应 List<GanttVO>)
 * @param {number|null} id - 项目ID，可选
 * @returns {Promise}
 */
export function getGanttData(id) {
  const params = {}
  if (id) params.id = id
  return request({
    url: '/dashboard/gantt',
    method: 'get',
    params
  })
}
