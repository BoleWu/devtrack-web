import request from '@/utils/request'

/**
 * 添加角色人员
 * @param {Object} data { roleId, userIdList }
 */
export function addUserRole(data) {
  return request({
    url: '/userRole/addUserRole',
    method: 'post',
    data
  })
}

/**
 * 删除角色人员
 * @param {Object} data { roleId, userIdList }
 */
export function deleteUserRole(data) {
  return request({
    url: '/userRole/deleteUserRole',
    method: 'post',
    data
  })
}

/**
 * 查询角色下的人员列表 (复用 queryUserInfoByList 但通常需要 roleId 筛选，这里根据接口文档第8点调整)
 * 文档第8点: 删除角色人员接口地址似乎重复了，但参数不同，看起来像查询角色成员列表。
 * 假设第8点实际为查询角色成员列表接口
 * @param {Object} data { roleId, name, page, limit }
 */
export function queryUserRoleList(data) {
  return request({
    url: '/userRole/getUserRoleList', 
    method: 'post',
    data
  })
}
