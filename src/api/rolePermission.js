import request from '@/utils/request'

/**
 * 角色接口权限添加
 * @param {Object} data { roleId, permissionIds }
 */
export function createRolePermission(data) {
  return request({
    url: '/rolePermission/createRolePermission',
    method: 'post',
    data
  })
}

/**
 * 单个角色接口权限添加
 * @param {Object} data { roleId, permissionIds }
 */
export function createRolePermissionById(data) {
  return request({
    url: '/rolePermission/createRolePermissionById',
    method: 'post',
    data
  })
}

/**
 * 角色接口权限删除
 * @param {Object} data { roleId, permissionIds }
 */
export function deleteRolePermission(data) {
  return request({
    url: '/rolePermission/deleteRolePermission',
    method: 'post',
    data
  })
}

/**
 * 查询角色的接口权限列表
 * 根据文档第15点，查询角色接口权限
 * @param {Object} data { roleId }
 */
export function queryRolePermission(params) {
  return request({
    url: '/rolePermission/queryRolePermission', 
    method: 'get',
    params
  })
}

/**
 * 查询角色的接口权限列表 (分页版 - 如果需要)
 * @param {Object} data { roleId, page, limit }
 */
export function queryRolePermissionList(data) {
  return request({
    url: '/rolePermission/getRolePermissionList', // Guessing the API path based on userRole
    method: 'post',
    data
  })
}
