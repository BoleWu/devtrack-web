import request from '@/utils/request'

/**
 * 获取项目列表 (分页)
 * @param {Object} params - 查询参数 { name, page, limit }
 * @returns {Promise}
 */
export function getProjectList(params) {
  return request({
    url: '/project/getProjectByList',
    method: 'post',
    data: params
  })
}

/**
 * 创建项目
 * 尝试多个 API 端点以兼容不同的后端实现
 * @param {Object} data - 项目数据
 * @returns {Promise}
 */
export async function createProject(data) {
  const payload = data && typeof data === 'object' ? data : {}

  const attempts = [
    () =>
      request({
        url: '/project/createproject',
        method: 'post',
        data: payload
      }),
    () =>
      request({
        url: '/project/createProject',
        method: 'post',
        data: payload
      })
  ]

  // 轮询尝试，直到成功或全部失败
  let lastError
  for (const run of attempts) {
    try {
      return await run()
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

/**
 * 更新项目
 * @param {number} id - 项目ID
 * @param {Object} data - 更新数据 { name, description, status }
 * @returns {Promise}
 */
export function updateProject(id, data) {
  return request({
    url: '/project/updateProject',
    method: 'post',
    data: {
      id,
      name: data.name,
      description: data.description,
      status: data.status
    }
  })
}

/**
 * 更新项目成员信息
 * @param {Object} data - { id: projectId, members: [{id, name}, ...] }
 * @returns {Promise}
 */
export function updateProjectUserInfo(data) {
  return request({
    url: '/api/project/updateProjectUserInfo',
    method: 'post',
    data
  })
}

/**
 * 删除项目
 * @param {number} id - 项目ID
 * @returns {Promise}
 */
export function deleteProject(id) {
  return request({
    url: '/project/deleteProject',
    method: 'get',
    params: { projectId: id }
  })
}
