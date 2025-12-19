import { ref } from 'vue'
import type { Post, Category } from '@/types'
import type { Ref } from 'vue'
import { getCategories } from '@/api/category'
import type { PostResponse } from '@/api/post'

/**
 * 文章数据查询参数接口
 */
export interface FetchParams {
  page: number
  pageSize: number
  categoryId?: number
  ids?: number[]
  keyword?: string
}

/**
 * 文章数据查询结果接口
 */
export interface FetchResult {
  list: Post[]
  total: number
  hasMore: boolean
}

/**
 * 创建共享的数据状态
 */
export function createPostsDataState() {
  // 本地缓存的文章列表
  const allPosts = ref<Post[]>([])
  const categories = ref<Category[]>([])

  return {
    allPosts,
    categories
  }
}

/**
 * 获取分类列表
 */
export async function fetchCategories(categories: Ref<Category[]>) {
  try {
    const res = await getCategories()
    categories.value = res
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

/**
 * 工具函数：将后端返回的 PostResponse 转换为前端的 Post 类型
 */
export function transformPost(postData: PostResponse, categories: Category[]): Post {
  const category = categories.find(c => c.id === postData.category_id) || {
    id: postData.category_id,
    name: '未分类',
    slug: 'uncategorized'
  }

  const date = postData.created_at ? postData.created_at.split('T')[0] : ''

  return {
    id: postData.id,
    title: postData.title,
    desc: postData.desc,
    content: postData.content,
    cover: postData.cover,
    views: postData.views,
    is_curated: postData.is_curated || false,
    date,
    category,
    readTime: Math.ceil((postData.content?.length || 0) / 500),
    category_id: postData.category_id,
    user_id: postData.user_id,
    author: postData.author,
    created_at: postData.created_at,
    updated_at: postData.updated_at
  }
}
