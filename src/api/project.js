import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/project/getProjectByList',
    method: 'get',
    params // status, userId 等
  })
}

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

export async function updateProject(id, data) {
  const payload = data && typeof data === 'object' ? data : {}

  const attempts = [
    () =>
      request({
        url: `/project/projects/${id}`,
        method: 'put',
        data: payload
      }),
    () =>
      request({
        url: '/project/updateproject',
        method: 'put',
        data: { id, ...payload }
      }),
    () =>
      request({
        url: '/project/updateproject',
        method: 'post',
        data: { id, ...payload }
      }),
    () =>
      request({
        url: `/project/${id}`,
        method: 'put',
        data: payload
      })
  ]

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

export async function deleteProject(id) {
  const attempts = [
    () =>
      request({
        url: `/project/projects/${id}`,
        method: 'delete'
      }),
    () =>
      request({
        url: `/project/deleteproject/${id}`,
        method: 'delete'
      }),
    () =>
      request({
        url: '/project/deleteproject',
        method: 'delete',
        params: { id }
      }),
    () =>
      request({
        url: '/project/deleteproject',
        method: 'post',
        data: { id }
      }),
    () =>
      request({
        url: `/project/${id}`,
        method: 'delete'
      })
  ]

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
