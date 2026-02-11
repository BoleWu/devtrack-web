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
 * @param {number} id - 任务ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateTask(id, data) {
  return request({
    url: `/task/tasks/${id}`, // 注意：如果你的后端是 PUT /tasks，请去掉 /{id}
    method: 'put',
    data
  })
}

/**
 * 更新任务状态（拖拽看板时使用）
 * @param {number} id - 任务ID
 * @param {string} status - 新状态
 * @returns {Promise}
 */
export function updateTaskStatus(id, status) {
  return request({
    url: `/task/tasks/${id}/status`,
    method: 'put',
    params: { status } // 假设后端接收 @RequestParam 或 @RequestBody，请根据实际调整
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
