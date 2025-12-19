import { ref, onUnmounted, nextTick } from 'vue'

export function usePagination<T>(
  fetcher: (page: number) => Promise<{ list: T[], hasMore: boolean }>,
  options: { animationClass?: string } = {}
) {
  const list = ref<T[]>([]) as any
  const page = ref(1)
  const isLoading = ref(false) // 初始加载或加载更多中
  const isInitialLoad = ref(true) // 是否是第一次加载
  const hasMore = ref(true)

  // 底部观察器 Sentinel
  const sentinelRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  // 加载数据核心逻辑
  const loadData = async (reset = false) => {
    if (reset) {
      page.value = 1
      list.value = []
      hasMore.value = true
      isInitialLoad.value = true
    }

    if (!hasMore.value || (isLoading.value && !reset)) return

    isLoading.value = true

    try {
      const res = await fetcher(page.value)

      if (reset) {
        list.value = res.list
      } else {
        list.value.push(...res.list)
      }

      hasMore.value = res.hasMore
      page.value++

      // GSAP 进场动画
      if (res.list.length > 0 && options.animationClass) {
        await nextTick()
      }

    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
      isInitialLoad.value = false
    }
  }

  // 初始化观察器
  const initObserver = () => {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
        loadData()
      }
    }, { rootMargin: '200px' }) // 提前200px预加载

    if (sentinelRef.value) observer.observe(sentinelRef.value)
  }

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return {
    list,
    isLoading,
    isInitialLoad,
    hasMore,
    sentinelRef,
    loadData,
    initObserver
  }
}
