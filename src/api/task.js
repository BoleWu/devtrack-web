import request from '@/utils/request'

// 获取任务列表（支持按项目ID筛选）
export function getTaskList(params) {
  return request({
    url: '/tasks',
    method: 'get',
    params // 可能包含 projectId, assigneeId, status 等
  })
}

// 获取单个任务详情
export function getTaskDetail(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

// 创建任务
export function createTask(data) {
  return request({
    url: '/tasks',
    method: 'post',
    data // TaskDTO
  })
}

// 更新任务
export function updateTask(id, data) {
  return request({
    url: `/tasks/${id}`, // 注意：如果你的后端是 PUT /tasks，请去掉 /{id}
    method: 'put',
    data
  })
}

// 更新任务状态（拖拽看板时使用）
export function updateTaskStatus(id, status) {
  return request({
    url: `/tasks/${id}/status`,
    method: 'put',
    params: { status } // 假设后端接收 @RequestParam 或 @RequestBody，请根据实际调整
  })
}

// 删除任务
export function deleteTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}