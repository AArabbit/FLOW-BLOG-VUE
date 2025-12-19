import { getPosts, searchPosts, getCategoryPosts } from '@/api/post'
import type { Ref } from 'vue'
import type { Post, Category } from '@/types'
import { transformPost, FetchParams, FetchResult, fetchCategories } from './posts-data'


/**
 * 列表查询相关的逻辑
 */
export function createPostsListActions(
  allPosts: Ref<Post[]>,
  categories: Ref<Category[]>
) {
  /**
   * 分页列表查询 - 支持多种模式：普通列表、搜索、按ID过滤（收藏）
   */
  const fetchPosts = async (params: FetchParams): Promise<FetchResult> => {
    try {
      if (categories.value.length === 0) {
        await fetchCategories(categories)
      }

      let list: Post[] = []
      let total = 0
      let hasMore = false

      if (params.keyword && params.keyword.trim()) {
        // 搜索模式
        const res = await searchPosts({
          page: params.page,
          page_size: params.pageSize,
          keyword: params.keyword
        })

        list = res.search.map(p => transformPost(p, categories.value))
        total = typeof res.total === 'string' ? parseInt(res.total) : res.total
        hasMore = list.length >= params.pageSize
      } else if (params.ids !== undefined) {
        // === 按 ID 过滤模式（用于收藏列表）===
        if (params.ids.length === 0) {
          list = []
          total = 0
          hasMore = false
        } else {
          const res = await getPosts({
            page: params.page,
            page_size: params.pageSize
          })

          list = res.postList.map(p => transformPost(p, categories.value))
          // 只返回在 ids 列表中的文章
          list = list.filter(post => params.ids!.includes(post.id))
          total = params.ids.length
          // 根据过滤后的结果判断是否有更多
          hasMore = list.length >= params.pageSize
        }
      } else if (params.categoryId !== undefined) {
        // === 按分类查询模式 ===
        const res = await getCategoryPosts({
          page: params.page,
          page_size: params.pageSize,
          category_id: params.categoryId
        })

        // 后端返回的结构 data.posts
        list = res.posts.map(p => transformPost(p, categories.value))
        hasMore = list.length >= params.pageSize
        total = 0
      } else {
        // === 普通列表模式 ===
        const res = await getPosts({
          page: params.page,
          page_size: params.pageSize
        })

        list = res.postList.map(p => transformPost(p, categories.value))
        total = res.total
        hasMore = res.has_more
      }

      // 仅在非搜索模式下缓存首页数据
      if (!params.keyword && !params.ids) {
        if (params.page === 1) {
          allPosts.value = list
        } else {
          const existingIds = new Set(allPosts.value.map(p => p.id))
          const newPosts = list.filter(p => !existingIds.has(p.id))
          allPosts.value.push(...newPosts)
        }
      }

      return { list, total, hasMore }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      return { list: [], total: 0, hasMore: false }
    }
  }

  /**
   * 按分类获取文章
   */
  const getPostsByCategory = (categoryId: number) => {
    return allPosts.value.filter(p => p.category.id === categoryId)
  }

  /**
   * 同步获取文章（从缓存）
   */
  const getPostById = (id: number) => allPosts.value.find(p => p.id === id)

  return {
    fetchPosts,
    getPostsByCategory,
    getPostById
  }
}
