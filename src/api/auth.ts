import request from '@/utils/request'

import type { User } from '@/types'

// 登录响应中的收藏项结构
export interface BookmarkItem {
  post_id: number
}

// 登录响应中的用户信息结构
export interface LoginUserInfo extends Omit<User, 'bookmarks'> {
  bookmarks: BookmarkItem[]
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  userInfo: LoginUserInfo
}

export interface UserListResponse {
  useList: any[]
  total: number
}

export function login(data: any) {
  return request.post<any, LoginResponse>('/login', data)
}

export function getGithubAuthUrl() {
  return request.get<any, { url: string }>('/github_login')
}

export function githubCallback(data: any) {
  return request.post<any, LoginResponse>('/github_callback', data)
}

export function refreshToken(token: string) {
  return request.post<any, LoginResponse>('/refresh', { refresh_token: token })
}

export function sendEmailCode(email: string) {
  return request.post<any, { code: string }>('/email', { email })
}

export function register(data: any) {
  return request.post<any, { msg: string }>('/register', data)
}

export function getUser(id: number) {
  return request.post<any, any>(`/auth/user_info`, { userId: id })
}

// 规范化 bookmarks 数据格式
export function normalizeBookmarks(bookmarks: any): number[] {
  if (!bookmarks) return []
  if (Array.isArray(bookmarks)) {
    // 如果是数组，检查元素类型
    if (bookmarks.length === 0) return []
    if (typeof bookmarks[0] === 'number') {
      // 已经是数字数组
      return bookmarks
    }
    if (typeof bookmarks[0] === 'object' && 'post_id' in bookmarks[0]) {
      // 是 BookmarkItem 数组，需要转换
      return bookmarks.map((b: BookmarkItem) => b.post_id)
    }
  }
  return []
}

export function getUserList(params: { page: number; page_size: number }) {
  return request.post<any, UserListResponse>('/auth/user_list', params)
}

export function updateUser(id: number, data: { user_name: string; email: string; role: string; avatar: string }) {
  return request.put<any, any>(`/auth/up_user/${id}`, data)
}


export function deleteUser(id: number) {
  return request.delete<any, any>(`/auth/delete_user/${id}`)
}

export interface UpdatePasswordData {
  code: string
  email: string
  password: string
}

export function updatePassword(data: UpdatePasswordData) {
  return request.post<any, { msg: string }>(`/up_userPass`, data)
}
