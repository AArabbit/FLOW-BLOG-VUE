import { defineStore } from 'pinia'
import { ref } from 'vue'
import { handleScrollLock } from '@/utils/scrollLock' // 引入封装的函数

export const useUIStore = defineStore('ui', () => {
  // --- 登录弹窗状态 ---
  const showLoginModal = ref(false)
  const isLoginError = ref(false)
  const authMessage = ref('')

  // --- 设置抽屉状态 ---
  const settingsOpen = ref(false)

  // --- Actions ---

  function toggleLoginModal(show: boolean) {
    showLoginModal.value = show
    if (!show) resetAuthStatus()
    // 防抖动处理
    handleScrollLock(show)
  }

  // 切换设置抽屉
  function toggleSettings(show: boolean) {
    settingsOpen.value = show
    // 调用通用锁定函数
    handleScrollLock(show)
  }

  function setAuthError(message: string) {
    isLoginError.value = true
    authMessage.value = message
  }

  function setAuthSuccess(message: string) {
    isLoginError.value = false
    authMessage.value = message
  }

  function resetAuthStatus() {
    isLoginError.value = false
    authMessage.value = ''
  }

  return {
    showLoginModal,
    isLoginError,
    authMessage,
    settingsOpen, 
    toggleLoginModal,
    toggleSettings,
    setAuthError,
    setAuthSuccess,
    resetAuthStatus
  }
})
