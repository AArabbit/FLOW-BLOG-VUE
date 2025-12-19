import service from '@/utils/request'

// 收藏/取消收藏的参数结构
export interface BookmarkParams {
  user_id: number
  post_id: number
}

// 添加收藏
export function addBookmark(params: BookmarkParams): Promise<any> {
  return service.post('/auth/add_bookmark', params)
}

// 取消收藏
export function deleteBookmark(params: BookmarkParams): Promise<any> {
  return service.post('/auth/delete_bookmark', params)
}
