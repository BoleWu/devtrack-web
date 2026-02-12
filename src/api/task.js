import request from '@/utils/request'

/**
 * 获取任务列表
 * @param {Object} params - 查询参数 { projectId, assigneeId, status... }
 * @returns {Promise}
 */
export function getTaskList(params) {
  return request({
    url: '/task/getTaskByList',
    method: 'get',
    params // 可能包含 projectId, assigneeId, status 等
  })
}

/**
 * 获取任务详情
 * @param {number} id - 任务ID
 * @returns {Promise}
 */
export function getTaskDetail(id) {
  return request({
    url: `/task/tasks/${id}`,
    method: 'get'
  })
}

/**
 * 创建任务
 * @param {Object} data - 任务数据
 * @returns {Promise}
 */
export function createTask(data) {
  return request({
    url: '/task/createTask',
    method: 'post',
    data // TaskDTO
  })
}

/**
 * 更新任务信息
 * @param {Object} data - 更新数据 (TaskDTO: { id, projectId, title, description, status, deadline, priority })
 * @returns {Promise}
 */
export function updateTask(data) {
  return request({
    url: '/task/updatetask',
    method: 'post',
    data
  })
}

/**
 * 更新任务状态
 * @param {number} taskId - 任务ID
 * @param {string} newstatus - 新状态
 * @returns {Promise}
 */
export function updateTaskStatus(taskId, newstatus) {
  return request({
    url: '/task/status',
    method: 'post',
    data: { taskId, newstatus }
  })
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 * @returns {Promise}
 */
export function deleteTask(id) {
  return request({
    url: '/task/deleteTask',
    method: 'get',
    params: { id }
  })
}

export function taskAssignee(taskId, list) {
  return request({
    url: '/task/taskAssignee',
    method: 'post',
    data: { taskId, list }
  })
}

export function activateTask(taskId, newstatus) {
  return request({
    url: '/task/activateTask',
    method: 'post',
    data: { taskId, newstatus }
  })
}
