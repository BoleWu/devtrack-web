import request from '@/utils/request'

/**
 * 分页查询接口权限列表
 * @param {Object} data { name, page, limit }
 */
export function queryPermissionByList(data) {
  return request({
    url: '/permission/queryPermissionByList',
    method: 'post',
    data
  })
}

/**
 * 创建接口权限
 * @param {Object} data { name, code, description, method, path }
 */
export function createPermission(data) {
  return request({
    url: '/permission/createPermission',
    method: 'post',
    data
  })
}

/**
 * 更新接口权限
 * @param {Object} data { id, name, code, description, method, path }
 */
export function updatePermission(data) {
  return request({
    url: '/permission/updatePermission',
    method: 'post',
    data
  })
}

/**
 * 删除接口权限
 * @param {Object} params { id }
 */
export function deletePermission(params) {
  return request({
    url: '/permission/deletePermission',
    method: 'get',
    params
  })
}
