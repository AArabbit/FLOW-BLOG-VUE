import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

// 获取环境变量
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 创建 axios 实例
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10000 // 请求超时时间
})

// Naive UI 的消息提示，用于报错
const { message } = createDiscreteApi(['message'])

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 这里可以添加 Token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // code 200 为成功
    if (res.code !== 200) {
      message.error(res.msg || 'Error')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res.data
  },
  (error) => {
    console.error('Request Err:', error)
    message.error(error.message || 'Request Failed')
    return Promise.reject(error)
  }
)

export default service
