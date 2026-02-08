import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录数据 { username, password }
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data // UserLoginDTO
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据 { username, password, email }
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data // UserRegisterDTO
  })
}