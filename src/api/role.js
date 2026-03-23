import request from '@/utils/request'

/**
 * 分页查询角色列表
 * @param {Object} data { name, page, limit, status }
 */
export function queryRoleByList(data) {
  return request({
    url: '/role/queryRoleBylist',
    method: 'post',
    data
  })
}

/**
 * 创建角色
 * @param {Object} data { code, name, description, status }
 */
export function createRole(data) {
  return request({
    url: '/role/createRole',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {Object} data { id, code, name, description, status }
 */
export function updateRole(data) {
  return request({
    url: '/role/updateRole',
    method: 'post',
    data
  })
}

/**
 * 更新角色状态
 * @param {Object} data { roleId, status }
 */
export function updateRoleStatus(data) {
  return request({
    url: '/role/updateRoleStatus',
    method: 'post',
    data
  })
}

/**
 * 删除角色
 * @param {Object} params { id }
 */
export function deleteRole(params) {
  return request({
    url: '/role/deleteRole',
    method: 'get',
    params
  })
}
