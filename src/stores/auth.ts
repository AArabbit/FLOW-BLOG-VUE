import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { useUIStore } from './ui'
import { useAdminStore } from './admin'
import { message } from '@/utils/discreteApi'

const STORAGE_KEY = 'mind_flow_auth_session'
const EXPIRATION_DAYS = 3
const ADMIN_CREDENTIALS = { username: 'admin', password: 'password' }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const uiStore = useUIStore()
  const adminStore = useAdminStore()

  // 持久化
  // 导出方法，供 Bookmarks Store 在更新数据后调用
  function persistUserSession() {
    if (!user.value) return
    const session = {
      user: user.value,
      expiry: new Date().getTime() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY)
  }

  function loadSession() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (new Date().getTime() < session.expiry) {
          user.value = session.user
          // 同步 Admin Store 中的最新数据 (防止数据陈旧)
          const freshUser = adminStore.userList.find(u => u.id === session.user?.id)
          if (freshUser) user.value = freshUser
        } else {
          clearSession()
        }
      } catch (e) {
        clearSession()
      }
    }
  }

  // 初始化加载
  loadSession()

  // --- Auth Actions ---

  function login(form: { username: string; password: string }) {
    uiStore.resetAuthStatus()

    // 1. 管理员校验
    if (form.username === ADMIN_CREDENTIALS.username && form.password === ADMIN_CREDENTIALS.password) {
      const adminUser = adminStore.findAdmin()
      if (adminUser) {
        user.value = adminUser
        persistUserSession()
        uiStore.toggleLoginModal(false)
        message.success('欢迎回来，管理员')
        return true
      }
    }

    // 2. 普通用户校验
    const existingUser = adminStore.findUserByUsername(form.username)
    if (existingUser && existingUser.role !== 'admin') {
      user.value = existingUser
      persistUserSession()
      uiStore.toggleLoginModal(false)
      message.success(`欢迎回来，${existingUser.name}`)
      return true
    }

    uiStore.setAuthError('账号或密码错误 (提示: admin / password)')
    message.error('登录失败：账号或密码错误')
    return false
  }

  function logout() {
    user.value = null
    clearSession()
    message.success('已安全退出登录')
  }

  function register(form: { username: string; password: string; email: string; code: string }): Promise<boolean> {
    return new Promise((resolve) => {
      uiStore.resetAuthStatus()
      setTimeout(() => {
        if (form.code !== '123456') {
          uiStore.setAuthError('验证码错误 (测试请用 123456)')
          message.error('验证码错误')
          resolve(false)
          return
        }
        const newUser: User = {
          id: Date.now(),
          name: form.username,
          email: form.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`,
          role: 'user',
          bookmarks: []
        }
        adminStore.addUser(newUser)
        uiStore.setAuthSuccess('注册成功！请使用新账号登录。')
        message.success('注册成功，请登录')
        resolve(true)
      }, 1000)
    })
  }

  function resetPassword(form: { email: string; code: string; password: string }): Promise<boolean> {
    return new Promise((resolve) => {
      uiStore.resetAuthStatus()
      setTimeout(() => {
        if (form.code !== '123456') {
          uiStore.setAuthError('验证码错误')
          message.error('验证码错误')
          resolve(false)
          return
        }
        uiStore.setAuthSuccess('密码重置成功！请登录。')
        message.success('密码重置成功')
        resolve(true)
      }, 1000)
    })
  }

  function sendVerificationCode(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`[Mock Mail] Code: 123456 to ${email}`)
      setTimeout(() => {
        message.info('验证码已发送 (请查看控制台)')
        resolve(true)
      }, 1000)
    })
  }

  
  // 用于用户自己修改资料或注销账号

  function deleteCurrentAccount() {
    if (!user.value) return
    adminStore.deleteUser(user.value.id)
    logout()
  }

  function updateCurrentUser(updatedUser: Partial<User>) {
    if (!user.value) return
    const freshUser = adminStore.updateUser({ ...updatedUser, id: user.value.id })
    if (freshUser) {
      user.value = freshUser
      persistUserSession()
    }
  }

  return {
    user,
    login,
    logout,
    register,
    resetPassword,
    sendVerificationCode,
    deleteCurrentAccount,
    updateCurrentUser,
    persistUserSession // 导出给 bookmarks store 使用
  }
})
