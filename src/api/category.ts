import request from '@/utils/request'
import type { Category } from '@/types'

export function getCategories() {
  return request.get<any, { categoryList: Category[] }>('/categories').then(res => res.categoryList)
}
