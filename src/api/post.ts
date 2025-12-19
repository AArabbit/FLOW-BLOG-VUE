import service from '@/utils/request'
import type { User } from '@/types'

// 后端返回的文章数据结构
export interface PostResponse {
  id: number
  title: string
  desc: string
  content: string
  cover: string
  category_id: number
  user_id: number
  views: number
  is_curated: boolean
  created_at: string
  updated_at: string
  author: User
}

// 获取文章列表的响应结构
export interface GetPostsResponse {
  has_more: boolean
  total: number
  postList: PostResponse[]
}

// 获取文章列表的参数
export interface GetPostsParams {
  page: number
  page_size: number
}

export interface CreatePostParams {
  title: string
  desc: string
  content: string
  cover: string
  category_id: number
  user_id: number
  views: number
  is_curated?: boolean
}

export interface SearchPostsParams {
  page: number
  page_size: number
  keyword: string
}

export interface SearchPostsResponse {
  has_more: boolean
  total: string
  search: PostResponse[]
}

// 获取分类文章列表的参数
export interface GetCategoryPostsParams {
  page: number
  page_size: number
  category_id: number
}

// 获取分类文章列表的响应结构
export interface GetCategoryPostsResponse {
  posts: PostResponse[]
  has_more: boolean
  total: number
}

// 获取分类文章列表
export function getCategoryPosts(params: GetCategoryPostsParams): Promise<GetCategoryPostsResponse> {
  return service.post<any, GetCategoryPostsResponse>('/categoriesPosts', params)
}

// 获取文章列表
export function getPosts(params: GetPostsParams): Promise<GetPostsResponse> {
  return service.post<any, GetPostsResponse>('/posts', params)
}

// 搜索文章
export function searchPosts(params: SearchPostsParams): Promise<SearchPostsResponse> {
  return service.post<any, SearchPostsResponse>('/search', params)
}

export function addPost(data: CreatePostParams): Promise<any> {
  return service({
    url: 'auth/add_post',
    method: 'post',
    data
  })
}

// 获取文章详情的响应结构
export interface PostDetailResponse {
  postsDetail: PostResponse
}

// 获取文章详情
export function getPostDetail(id: number): Promise<PostDetailResponse> {
  return service.get<any, PostDetailResponse>(`/posts/${id}`)
}

// 更新浏览量的参数结构
export interface UpdateViewsParams {
  posts_id: number
  views: number
}

// 更新文章浏览量
export function updateViews(params: UpdateViewsParams): Promise<any> {
  return service.post('/up_views', params)
}

// 更新文章的参数结构
export interface UpdatePostParams {
  // 必传字段
  category_id: number
  user_id: number
  // 可选字段
  title?: string
  desc?: string
  content?: string
  cover?: string
  views?: number
  is_curated?: boolean
}

// 更新文章
export function updatePost(id: number, data: UpdatePostParams): Promise<any> {
  return service.put(`/auth/up_post/${id}`, data)
}

// 删除文章
export function deletePostApi(id: number): Promise<any> {
  return service.delete(`/delete_post/${id}`)
}

// 每日精选文章响应结构
export interface DailyPostResponse {
  postsDaily: PostResponse
}

// 获取每日精选文章
export function getDailyPost(): Promise<DailyPostResponse> {
  return service.get<any, DailyPostResponse>('/postsDaily')
}

// 草稿保存参数
export interface SaveDraftParams {
  userId: number
  draft: string
}

// 草稿响应结构（Axios 拦截器已处理，返回的是 data 内容）
export interface DraftResponse {
  draft: string
}

// 保存草稿
export function saveDraft(data: SaveDraftParams): Promise<any> {
  return service.post('/auth/draft_posts', data)
}

// 获取草稿
export function getDraft(userId: number): Promise<DraftResponse> {
  return service.get<any, DraftResponse>(`/auth/draft_posts/${userId}`)
}
