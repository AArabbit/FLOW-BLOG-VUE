import { defineStore } from 'pinia'
import { ref } from 'vue'
import { handleScrollLock } from '@/utils/scrollLock'

export const useThemeStore = defineStore('theme', () => {
  const themeColor = ref('#2a2a2a')
  const searchOpen = ref(false)

  // 缓存视图白名单
  // 初始为空，或者包含 'HomeView' 也没关系，路由守卫会自动管理
  const cachedViews = ref<string[]>([])

  const isDark = ref(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  function setThemeColor(color: string) {
    themeColor.value = color
    document.documentElement.style.setProperty('--primary-color', color)
  }

  function toggleSearch(status: boolean) {
    searchOpen.value = status
    handleScrollLock(status)
  }

  function toggleDarkMode(value: boolean) {
    isDark.value = value
    if (value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // 添加页面缓存
  function addCachedView(viewName: string) {
    if (!cachedViews.value.includes(viewName)) {
      cachedViews.value.push(viewName)
    }
  }

  // 移除页面缓存
  function removeCachedView(viewName: string) {
    const index = cachedViews.value.indexOf(viewName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }

  return {
    themeColor,
    searchOpen,
    isDark,
    cachedViews, 
    setThemeColor,
    toggleSearch,
    toggleDarkMode,
    addCachedView,    
    removeCachedView  
  }
})