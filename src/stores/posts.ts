import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { GroupedPosts, Post } from '@/types'
import { createPostsDataState, fetchCategories as dataFetchCategories } from './modules/posts-data'
import { createPostsListActions } from './modules/posts-list'
import { createPostsAdminActions } from './modules/posts-admin'
import { createPostsDetailActions } from './modules/posts-detail'
import { createPostsEditActions } from './modules/posts-edit'

/**
 * 文章 Store - 整合所有文章相关的逻辑
 */
export const usePostStore = defineStore('posts', () => {
  // 共享数据状态
  const { 
    allPosts, 
    categories 
  } = createPostsDataState()

  // 列表查询相关
  const { 
    fetchPosts, 
    getPostsByCategory, 
    getPostById 
  } = createPostsListActions(allPosts, categories)

  // 管理端相关
  const { 
    adminPosts, 
    adminTotal, 
    adminPage, 
    adminPageSize, 
    fetchAdminPosts 
  } = createPostsAdminActions(categories)

  // 文章详情相关
  const { fetchPostDetail } = createPostsDetailActions(allPosts, categories)

  // 文章编辑相关
  const { 
    deletePost, 
    savePost: savePostImpl,
    saveDraftContent,
    loadDraft,
    hasDraftAvailable,
    clearDraftMark
  } = createPostsEditActions(
    allPosts,
    adminPage,
    adminPageSize,
    fetchAdminPosts
  )

  /**
   * 包装 savePost，添加分类信息
   */
  async function savePost(post: Partial<Post>) {
    await savePostImpl(post, categories.value)
  }

  /**
   * 获取按年份分组的文章列表
   */
  const postsGroupedByYear = computed<GroupedPosts>(() => {
    const groups: GroupedPosts = {}
    allPosts.value.forEach(post => {
      const year = post.date.split('-')[0]
      if (!groups[year]) groups[year] = []
      groups[year].push(post)
    })
    return groups
  })

  /**
   * 获取时间线文章（按年份分组）
   */
  const fetchTimelinePosts = async (): Promise<GroupedPosts> => {
    if (allPosts.value.length === 0) {
      await fetchPosts({ page: 1, pageSize: 100 })
    }
    return postsGroupedByYear.value
  }

  /**
   * 获取分类列表
   */
  const fetchCategories = async () => {
    await dataFetchCategories(categories)
  }

  return {
    // 数据状态
    posts: allPosts,
    adminPosts,
    adminTotal,
    adminPage,
    adminPageSize,
    categories,
    postsGroupedByYear,

    // 列表查询
    fetchPosts,
    getPostById,
    getPostsByCategory,

    // 详情查询
    fetchPostDetail,
    fetchTimelinePosts,

    // 管理端操作
    fetchAdminPosts,
    deletePost,
    savePost,
    saveDraftContent,
    loadDraft,
    hasDraftAvailable,
    clearDraftMark,

    // 其他
    fetchCategories
  }
})