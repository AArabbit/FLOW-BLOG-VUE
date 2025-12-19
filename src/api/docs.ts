import service from '@/utils/request'

export interface DocItem {
  id: number
  title: string
  category: string
  category_id: number
  url: string
}

export interface CategoryItem {
  id: number
  name: string
  docs: DocItem[]
}

export interface DocsResponse {
  docList: CategoryItem[]
}

// Assuming the API returns the "data" object directly as per standard interceptors
export function getDocs(): Promise<DocsResponse> {
  return service.get<any, DocsResponse>('/docs')
}
