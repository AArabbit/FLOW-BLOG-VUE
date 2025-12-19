import { ref } from 'vue'
import { getPosts } from '@/api/post'
import type { Ref } from 'vue'
import type { Post, Category } from '@/types'
import { transformPost, fetchCategories } from './posts-data'

/**
 * 管理端相关的逻辑
 */
export function createPostsAdminActions(
  categories: Ref<Category[]>
) {
  // 管理端独立状态
  const adminPosts = ref<Post[]>([])
  const adminTotal = ref(0)
  const adminPage = ref(1)
  const adminPageSize = ref(50)

  /**
   * 管理端查询文章列表
   */
  const fetchAdminPosts = async (page = 1, size = 50) => {
    try {
      if (categories.value.length === 0) {
        await fetchCategories(categories)
      }

      const res = await getPosts({
        page,
        page_size: size
      })

      const list = res.postList.map(p => transformPost(p, categories.value))
      adminPosts.value = list
      adminTotal.value = res.total
      adminPage.value = page
      adminPageSize.value = size
    } catch (error) {
      console.error('Failed to fetch admin posts:', error)
    }
  }

  return {
    adminPosts,
    adminTotal,
    adminPage,
    adminPageSize,
    fetchAdminPosts
  }
}
