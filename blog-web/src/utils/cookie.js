import Cookies from 'js-cookie'

const TokenKey = 'blog_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  // 设置 cookie，7天有效期
  return Cookies.set(TokenKey, token, { expires: 7 })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
} 