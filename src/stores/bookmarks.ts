import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAuthStore } from './auth'
import { useUIStore } from './ui'
import { message } from '@/utils/discreteApi'
import { addBookmark, deleteBookmark } from '@/api/bookmark'

export const useBookmarkStore = defineStore('bookmarks', () => {
  // 记录正在加载收藏的文章ID
  const loadingBookmarks = reactive(new Set<number>())

  // 引入其他 Store
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  // 判断是否收藏
  const isBookmarked = (postId: number) => {
    return authStore.user?.bookmarks?.includes(postId) || false
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

    const isCurrentlyBookmarked = isBookmarked(postId)
    let isAdded = false

    try {
      if (isCurrentlyBookmarked) {
        // 取消收藏
        await deleteBookmark({
          user_id: authStore.user.id,
          post_id: postId
        })
        // 从本地列表中移除
        if (authStore.user.bookmarks) {
          const index = authStore.user.bookmarks.indexOf(postId)
          if (index > -1) {
            authStore.user.bookmarks.splice(index, 1)
          }
        }
        message.info('已取消收藏')
      } else {
        // 添加收藏
        await addBookmark({
          user_id: authStore.user.id,
          post_id: postId
        })
        // 添加到本地列表
        if (!authStore.user.bookmarks) {
          authStore.user.bookmarks = []
        }
        authStore.user.bookmarks.push(postId)
        message.success('收藏成功')
        isAdded = true
      }

      // 同步持久化
      authStore.persistUserSession()
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      message.error(isCurrentlyBookmarked ? '取消收藏失败' : '收藏失败')
    } finally {
      // 移除 Loading
      loadingBookmarks.delete(postId)
    }

    return isAdded
  }

  return {
    isBookmarked,
    isBookmarkLoading,
    toggleBookmark
  }
})

