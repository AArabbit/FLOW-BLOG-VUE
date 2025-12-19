import service from '@/utils/request'

// 评论数据结构
export interface Comment {
  id: number
  post_id: number
  user_id: number
  user_name: string
  avatar: string
  content: string
  created_at: string
  updated_at: string
}

// 获取评论列表的响应结构
export interface GetCommentsResponse {
  comments: Comment[]
}

// 获取评论列表的参数
export interface GetCommentsParams {
  posts_id: number
}

// 获取文章评论列表
export function getComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
  return service.post<any, GetCommentsResponse>('/comments', params)
}

// 提交评论的参数结构
export interface AddCommentParams {
  post_id: number
  user_id: number
  user_name: string
  avatar: string
  content: string
}

// 提交评论
export function addComment(params: AddCommentParams): Promise<any> {
  return service.post('/auth/add_comment', params)
}

// 删除评论的参数结构
export interface DeleteCommentParams {
  comment_id: number
}

// 删除评论
export function deleteComment(params: DeleteCommentParams): Promise<any> {
  return service.post('/auth/delete_comment', params)
}
