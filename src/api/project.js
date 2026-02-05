import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/project/getProjectByList',
    method: 'get',
    params // status, userId 等
  })
}

export function createProject(data) {
  return request({
    url: '/project/createproject',
    method: 'post',
    data // ProjectDTO
  })
}

export function updateProject(id, data) {
  return request({
    url: `/project/projects/${id}`,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/project/projects/${id}`,
    method: 'delete'
  })
}