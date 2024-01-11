import axios from 'axios'

const MB = 1024 * 1024
const GB = 1024 * MB
const HTTP = axios.create({
  baseURL: '',
  withCredentials: true,
  maxContentLength: 1 * GB
})

HTTP.login = function (username, password) {
  const params = new FormData()
  params.append('username', username)
  params.append('password', password)
  return HTTP.post('/api/auth/login/', params)
}

HTTP.logout = function () {
  return HTTP.post('/api/auth/logout/')
}

HTTP.appendParams = function (url, params) {
  const u = new URL(url)
  for (let key in params) {
    if (params[key] !== undefined) {
      u.searchParams.append(key, params[key])
    }
  }
  return u.href
}

export default HTTP

