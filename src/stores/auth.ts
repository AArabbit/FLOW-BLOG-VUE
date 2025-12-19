import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { useUIStore } from './ui'
import { message } from '@/utils/discreteApi'
import * as authApi from '@/api/auth'
import { normalizeBookmarks } from '@/api/auth'

const STORAGE_KEY = 'mind_flow_auth_session'
const EXPIRATION_DAYS = 7

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const uiStore = useUIStore()

  // 居中打开窗口
  function openPopup(url: string, title: string, w: number, h: number) {
    const left = (window.screen.width - w) / 2
    const top = (window.screen.height - h) / 2
    return window.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    )
  }

  // 持久化
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
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  function loadSession() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (new Date().getTime() < session.expiry) {
          user.value = session.user
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

  // 处理登录成功逻辑
  function processLoginSuccess(res: any) {
    // 存储 Token
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)

    // 处理用户信息
    const userInfo = res.userInfo
    const bookmarkIds = normalizeBookmarks(userInfo.bookmarks)

    user.value = {
      ...userInfo,
      name: userInfo.username,
      bookmarks: bookmarkIds
    }
    persistUserSession()

    uiStore.toggleLoginModal(false)
    message.success(`欢迎回来，${user.value?.name || '用户'}`)
  }

  // 密码登录
  async function login(form: { username: string; password: string }) {
    uiStore.resetAuthStatus()
    try {
      const res = await authApi.login(form)
      processLoginSuccess(res)
      return true
    } catch (error: any) {
      uiStore.setAuthError(error.message || '登录失败')
      return false
    }
  }

    // Action: GitHub 登录
  function loginWithGithub(): Promise<boolean> {
    uiStore.resetAuthStatus()
    return new Promise(async (resolve) => {
      let popup: Window | null = null
      let timer: any | null = null

      // 清理函数
      const cleanup = () => {
        if (timer) clearInterval(timer)
        window.removeEventListener('message', handleMessage)
      }

      // 消息监听器
      const handleMessage = async (event: MessageEvent) => {
        // 安全检查：只接受来自同源的消息
        if (event.origin !== window.location.origin) return

        if (event.data?.type === 'GITHUB_AUTH_CODE') {
          const { code, state } = event.data
          cleanup() // 收到消息，清理监听
          
          // 调用后端接口
          const success = await handleGithubCallback(code, state)
          resolve(success)
        }
      }

      try {
        // 获取GitHub授权URL (后端生成)
        const res = await authApi.getGithubAuthUrl()
        if (!res.url) throw new Error('无法获取授权地址')

        // 监听消息
        window.addEventListener('message', handleMessage)

        // 打开弹窗 (URL指向GitHub -> GitHub指回首页)
        popup = openPopup(res.url, 'GitHub Login', 600, 700)

        // 轮询检测弹窗是否被用户手动关闭
        timer = setInterval(() => {
          if (popup && popup.closed) {
            cleanup()
            resolve(false) // 用户手动关闭，未完成登录
          }
        }, 1000)

      } catch (error: any) {
        cleanup()
        message.error(error.message || 'GitHub 登录初始化失败')
        resolve(false)
      }
    })
  }


  // 处理GitHub回调
  async function handleGithubCallback(code: string, state: string) {
    uiStore.resetAuthStatus()
    try {
      // 传入code和state
      const res = await authApi.githubCallback({ code, state })
      processLoginSuccess(res)
      uiStore.toggleLoginModal(false)
      return true
    } catch (error: any) {
      uiStore.setAuthError(error.message || 'GitHub 登录失败')
      return false
    }
  }

  function logout() {
    user.value = null
    clearSession()
    message.success('已安全退出登录')
  }

  async function register(form: { username: string; password: string; email: string; code: string }): Promise<boolean> {
    uiStore.resetAuthStatus()
    try {
      await authApi.register(form)
      uiStore.setAuthSuccess('注册成功！请使用新账号登录。')
      message.success('注册成功，请登录')
      return true
    } catch (error: any) {
      uiStore.setAuthError(error.msg || '注册失败')
      return false
    }
  }

  function resetPassword(form: { email: string; code: string; password: string }): Promise<boolean> {
    return new Promise(async (resolve) => {
      uiStore.resetAuthStatus()
      try {
        await authApi.updatePassword({
          code: form.code,
          email: form.email,
          password: form.password
        })
        uiStore.setAuthSuccess('密码重置成功！请登录。')
        message.success('密码重置成功')
        resolve(true)
      } catch (error: any) {
        uiStore.setAuthError(error.message || '密码重置失败')
        message.error(error.message || '密码重置失败')
        resolve(false)
      }
    })
  }

  async function sendVerificationCode(email: string): Promise<boolean> {
    try {
      const res = await authApi.sendEmailCode(email)
      message.success(`验证码已发送`)
      return true
    } catch (error: any) {
      message.error(error.message || '发送验证码失败')
      return false
    }
  }

  function deleteCurrentAccount() {
    if (!user.value) return
    // TODO: 待后端提供删除账号API后对接
    logout()
  }

  function updateCurrentUser(updatedUser: Partial<User>) {
    if (!user.value) return
    // 更新本地用户信息
    user.value = {
      ...user.value,
      ...updatedUser,
      bookmarks: updatedUser.bookmarks !== undefined ? updatedUser.bookmarks : user.value.bookmarks
    }
    persistUserSession()
  }

  return {
    user,
    login,
    logout,
    loginWithGithub,
    handleGithubCallback,
    register,
    resetPassword,
    sendVerificationCode,
    deleteCurrentAccount,
    updateCurrentUser,
    persistUserSession,
  }
})
