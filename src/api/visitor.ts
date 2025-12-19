import request from '@/utils/request'

export interface VisitorListResponse {
  visitor: any[]
  total: number,
  has_more: boolean
}


export function visitor(){
  return request.get('/visit')
}

export function getVisitor(params: { page: number; page_size: number }) {
  return request.post<any, VisitorListResponse>('/auth/visit_traffic', params)
}

export function deleteVisitor(id: number) {
  return request.post<any, any>(`/auth/delete_traffic/${id}`)
}