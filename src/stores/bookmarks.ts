import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAuthStore } from './auth'
import { useAdminStore } from './admin'
import { useUIStore } from './ui'
import { message } from '@/utils/discreteApi'

export const useBookmarkStore = defineStore('bookmarks', () => {
  // 记录正在加载收藏的文章ID
  const loadingBookmarks = reactive(new Set<number>())

  // 引入其他 Store
  const authStore = useAuthStore()
  const adminStore = useAdminStore()
  const uiStore = useUIStore()

  // 判断是否收藏
  const isBookmarked = (postId: number) => {
    return authStore.user?.bookmarks.includes(postId) || false
  }

  // 判断是否正在加载
  const isBookmarkLoading = (postId: number) => loadingBookmarks.has(postId)

  // 切换收藏状态
  const toggleBookmark = async (postId: number) => {
    // 检查登录
    if (!authStore.user) {
      uiStore.toggleLoginModal(true)
      message.warning('请先登录后再收藏文章')
      return false
    }

    // 设置 Loading
    loadingBookmarks.add(postId)

    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 更新数据
    const index = authStore.user.bookmarks.indexOf(postId)
    let isAdded = false

    if (index > -1) {
      authStore.user.bookmarks.splice(index, 1)
      message.info('已取消收藏')
    } else {
      authStore.user.bookmarks.push(postId)
      message.success('收藏成功')
      isAdded = true
    }

    // 同步持久化 (调用 Auth Store 的方法)
    authStore.persistUserSession()

    // 同步到 Admin Store (后端数据库)
    adminStore.updateUser({ id: authStore.user.id, bookmarks: authStore.user.bookmarks })

    // 移除 Loading
    loadingBookmarks.delete(postId)

    return isAdded
  }

  return {
    isBookmarked,
    isBookmarkLoading,
    toggleBookmark
  }
})
