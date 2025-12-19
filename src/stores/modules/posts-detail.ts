import { getPostDetail, updateViews } from '@/api/post'
import type { Ref } from 'vue'
import type { Post, Category } from '@/types'
import { transformPost, fetchCategories } from './posts-data'

/**
 * 文章详情相关的逻辑
 */
export function createPostsDetailActions(
  allPosts: Ref<Post[]>,
  categories: Ref<Category[]>
) {
  /**
   * 获取文章详情
   */
  const fetchPostDetail = async (id: number): Promise<Post | undefined> => {
    try {
      if (categories.value.length === 0) {
        await fetchCategories(categories)
      }

      const res = await getPostDetail(id)
      const postData = res.postsDetail
      const post = transformPost(postData, categories.value)

      const newViews = post.views + 1
      post.views = newViews

      const existingIndex = allPosts.value.findIndex(p => p.id === id)
      if (existingIndex !== -1) {
        allPosts.value[existingIndex] = post
      } else {
        allPosts.value.push(post)
      }

      updateViews({ posts_id: id, views: newViews }).catch(err => console.error(err))

      return post
    } catch (error) {
      console.error('Failed to fetch post detail:', error)
      return undefined
    }
  }

  return {
    fetchPostDetail
  }
}
