import { addPost, updatePost, deletePostApi, saveDraft, getDraft } from '@/api/post'
import type { Ref } from 'vue'
import type { Post, Category } from '@/types'
import { useAuthStore } from '../auth'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

/**
 * 文章编辑操作相关的逻辑
 */
export function createPostsEditActions(
  allPosts: Ref<Post[]>,
  adminPage: Ref<number>,
  adminPageSize: Ref<number>,
  fetchAdminPosts: (page: number, size: number) => Promise<void>
) {
  /**
   * 删除文章
   */
  async function deletePost(id: number) {
    await deletePostApi(id)
    await fetchAdminPosts(adminPage.value, adminPageSize.value)
    const index = allPosts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      allPosts.value.splice(index, 1)
    }
  }

  /**
   * 保存文章（新增或编辑）
   */
  async function savePost(post: Partial<Post>, categories: Category[]) {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not logged in')

    if (post.id) {
      // 编辑现有文章
      await updatePost(post.id, {
        category_id: post.category?.id || post.category_id || categories[0].id,
        user_id: authStore.user.id,
        title: post.title,
        desc: post.desc,
        content: post.content,
        cover: post.cover,
        views: post.views,
        is_curated: post.is_curated
      })

      const index = allPosts.value.findIndex(p => p.id === post.id)
      if (index !== -1) {
        allPosts.value[index] = { ...allPosts.value[index], ...post } as Post
      }
    } else {
      // 新增文章
      const res = await addPost({
        title: post.title!,
        desc: post.desc || '',
        content: post.content || '',
        cover: post.cover || '',
        category_id: post.category?.id || categories[0].id,
        user_id: authStore.user.id,
        views: 0,
        is_curated: post.is_curated || false
      })
      if (res) allPosts.value.push(res)
    }
    await fetchAdminPosts(adminPage.value, adminPageSize.value)
  }

  /**
   * 保存草稿
   */
  async function saveDraftContent(draftContent: string): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.user) {
      message.error('请先登录')
      return false
    }

    try {
      await saveDraft({
        userId: authStore.user.id,
        draft: draftContent
      })
      message.success('草稿已保存')
      // 标记该用户有草稿可读取
      localStorage.setItem(`draft_available_${authStore.user.id}`, 'true')
      return true
    } catch (error) {
      message.error('草稿保存失败')
      console.error('Save draft error:', error)
      return false
    }
  }

  /**
   * 获取用户草稿
   */
  async function loadDraft(): Promise<string | null> {
    const authStore = useAuthStore()
    if (!authStore.user) {
      console.log('User not logged in')
      return null
    }

    try {
      const response = await getDraft(authStore.user.id)
      if (response && response.draft) {
        return response.draft
      }
      return null
    } catch (error) {
      console.error('Load draft error:', error)
      return null
    }
  }

  /**
   * 检查用户是否有可用草稿（48小时内）
   */
  function hasDraftAvailable(): boolean {
    const authStore = useAuthStore()
    if (!authStore.user) {
      return false
    }
    return localStorage.getItem(`draft_available_${authStore.user.id}`) === 'true'
  }

  /**
   * 清除草稿标记
   */
  function clearDraftMark(): void {
    const authStore = useAuthStore()
    if (authStore.user) {
      localStorage.removeItem(`draft_available_${authStore.user.id}`)
    }
  }

  return {
    deletePost,
    savePost,
    saveDraftContent,
    loadDraft,
    hasDraftAvailable,
    clearDraftMark
  }
}
