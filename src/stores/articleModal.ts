// import router from '@/router'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useArticleModalStore = defineStore('articleModal', () => {
  // 状态
  const isVisible = ref(false)
  const currentPostId = ref<number | null>(null)
  const router = useRouter()
  const isMobile = window.innerWidth < 768

  // 打开文章
  const open = (id: number) => {
    currentPostId.value = id
    if (isMobile) {
      router.push(`/article/${id}`)
    } else {
      isVisible.value = true
      window.history.pushState({}, '', `/article/${id}`)
    }
  }

  // 关闭
  const close = () => {
    isVisible.value = false
    if (!isMobile) {
       window.history.pushState({}, '', '/')
    }
  }

  return {
    isVisible,
    currentPostId,
    open,
    close
  }
})