import axios, { type InternalAxiosRequestConfig } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { ResultCode } from './httpCode'

// 扩展 axios 请求配置，添加 _retry 属性
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// 获取环境变量
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 创建 axios 实例
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 15000 // 请求超时时间
})

// Naive UI 的消息提示
const { message } = createDiscreteApi(['message'])

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 这里可以添加 Token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
let isRefreshing = false
let requestsQueue: ((token: string) => void)[] = []

const handleRefreshToken = async (originalRequest: any) => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      requestsQueue.push((token) => {
        originalRequest.headers['Authorization'] = token
        resolve(service(originalRequest))
      })
    })
  }

  originalRequest._retry = true
  isRefreshing = true

  try {
    const refreshTokenStr = localStorage.getItem('refresh_token')
    if (!refreshTokenStr) {
      throw new Error('没有找到令牌')
    }

    const response = await axios.post(`${BASE_URL}/refresh`, {
      refresh_token: refreshTokenStr
    })

    const res = response.data
    if (res.code === ResultCode.SUCCESS) {
      const { access_token, refresh_token } = res.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      service.defaults.headers.common['Authorization'] = access_token

      requestsQueue.forEach((cb) => cb(access_token))
      requestsQueue = []

      // 更新原请求的 token
      originalRequest.headers['Authorization'] = access_token
      return service(originalRequest)
    } else {
      throw new Error('刷新令牌失败')
    }
  } catch (refreshError) {
    // 刷新失败，登出
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    message.warning('登录已过期，请重新登录')
    setTimeout(() => {
      window.location.reload()
    }, 1500)

    return Promise.reject(refreshError)
  } finally {
    isRefreshing = false
  }
}

service.interceptors.response.use(
  async (response) => {
    const res = response.data

    // 0: 请求成功
    if (res.code === ResultCode.SUCCESS) {
      return res.data
    }

    // 1004: 未授权/未登录 (Token 过期)
    if (res.code === ResultCode.UNAUTHORIZED) {
      const config = response.config as CustomAxiosRequestConfig
      if (config.url?.includes('/login')) {
        const errMsg = res.msg || '登录失败'
        message.error(errMsg)
        return Promise.reject(new Error(errMsg))
      }

      if (!config._retry) {
        return handleRefreshToken(config)
      }
    }

    // 其他错误码: 1001, 1002, 1003, 1005
    const errMsg = res.msg || 'Error'
    message.error(errMsg)
    return Promise.reject(new Error(errMsg))
  },
  (error) => {
    if (error.response?.status === 401) {
      return handleRefreshToken(error.config as CustomAxiosRequestConfig)
    }

    console.error('Request Err:', error)
    if (error.response?.status !== 401) {
      message.error(error.message || 'Request Failed')
    }
    return Promise.reject(error)
  }
)

export default service
