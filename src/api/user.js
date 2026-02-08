import request from '@/utils/request'

/**
 * 分页查询用户信息
 * @param {Object} data - 查询参数 { name, page, limit }
 * @returns {Promise}
 */
export function queryUserInfoByList(data) {
  return request({
    url: '/auth/queryUserInfoByList',
    method: 'post',
    data
  })
}
