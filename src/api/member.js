import request from '@/utils/request'

/**
 * 批量添加项目成员
 * @param {Object} data - { projectId, list: [{ userId, role }] }
 * @returns {Promise}
 */
export function addListMember(data) {
  return request({
    url: '/member/addListMember',
    method: 'post',
    data
  })
}
