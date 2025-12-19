import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as vistorApi from '@/api/visitor'

export const useVisitorStore = defineStore('visitor', () => {
  const list = ref<any[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(false)

  // 获取访客列表
  const fetchVisitors = async (page = 1, pageSize = 50) => {
    isLoading.value = true
    try {
      
      const res = await vistorApi.getVisitor({ page, page_size: pageSize })
      
      list.value = res.visitor || []
      total.value = res.total || 0
      currentPage.value = page
    } catch (error) {
      console.error('获取访客列表失败', error)
    } finally {
      isLoading.value = false
    }
  }

  // 删除访客
  const deleteVisitor = async (id: number) => {
    try {
      await vistorApi.deleteVisitor(id)
    } catch (error) {
      throw error
    }
  }

  return {
    list,
    total,
    currentPage,
    isLoading,
    fetchVisitors,
    deleteVisitor
  }
})