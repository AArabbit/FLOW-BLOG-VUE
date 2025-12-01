import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generatePosts, CATEGORIES } from '@/utils/mock'
import type { Post, Category, GroupedPosts } from '@/types'

interface FetchParams {
  page: number
  pageSize: number
  categoryId?: number
  ids?: number[]
  keyword?: string
}

interface FetchResult {
  list: Post[]
  total: number
  hasMore: boolean
}

export const usePostStore = defineStore('posts', () => {
  // 模拟数据库
  const allPosts = ref<Post[]>(generatePosts(100))
  const categories = ref<Category[]>(CATEGORIES)

  // 同步获取 (保留用于其他非异步场景)
  const getPostById = (id: number) => allPosts.value.find(p => p.id === id)

  const getPostsByCategory = (categoryId: number) => {
    return allPosts.value.filter(p => p.category.id === categoryId)
  }

  const postsGroupedByYear = computed<GroupedPosts>(() => {
    const groups: GroupedPosts = {}
    allPosts.value.forEach(post => {
      const year = post.date.split('-')[0]
      if (!groups[year]) groups[year] = []
      groups[year].push(post)
    })
    return groups
  })

  // 分页列表查询
  const fetchPosts = async (params: FetchParams): Promise<FetchResult> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    let filtered = allPosts.value
    if (params.categoryId) filtered = filtered.filter(p => p.category.id === params.categoryId)
    if (params.ids && params.ids.length > 0) filtered = filtered.filter(p => params.ids!.includes(p.id))
    else if (params.ids && params.ids.length === 0) return { list: [], total: 0, hasMore: false }
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    }
    const total = filtered.length
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    const list = filtered.slice(start, end)
    return { list, total, hasMore: end < total }
  }

  // 模拟获取文章详情的异步接口
  const fetchPostDetail = async (id: number): Promise<Post | undefined> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟数据库查询
    const post = allPosts.value.find(p => p.id === id)
    return post
  }

  const fetchTimelinePosts = async (): Promise<GroupedPosts> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return postsGroupedByYear.value
  }

  function deletePost(id: number) {
    const index = allPosts.value.findIndex(p => p.id === id)
    if (index !== -1) allPosts.value.splice(index, 1)
  }

  function savePost(post: Partial<Post>) {
    if (post.id) {
      const index = allPosts.value.findIndex(p => p.id === post.id)
      if (index !== -1) allPosts.value[index] = { ...allPosts.value[index], ...post } as Post
    } else {
      const newPost: Post = {
        id: Date.now(),
        title: post.title || '无标题',
        desc: post.desc || '',
        date: new Date().toISOString().split('T')[0],
        category: post.category || categories.value[0],
        readTime: 5,
        views: 0,
        cover: post.cover || `https://picsum.photos/seed/${Date.now()}/800/500`,
        ...post
      } as Post
      allPosts.value.unshift(newPost)
    }
  }

  return {
    posts: allPosts,
    categories,
    postsGroupedByYear,
    getPostById,
    getPostsByCategory,
    fetchPosts,
    fetchPostDetail,
    fetchTimelinePosts,
    deletePost,
    savePost
  }
})
