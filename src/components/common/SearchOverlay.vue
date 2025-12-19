<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { useArticleModalStore } from '@/stores/articleModal'
import { usePagination } from '@/utils/usePagination'

// 引入拆分的子组件
import SearchInput from '@/components/search/SearchInput.vue'
import SearchResults from '@/components/search/SearchResults.vue'

const postStore = usePostStore()
const themeStore = useThemeStore()
const articleModalStore = useArticleModalStore()

const query = ref('')
const overlayRef = ref<HTMLElement | null>(null)
const inputComponentRef = ref<{ focusInput: () => void } | null>(null)
const resultsComponentRef = ref<{ sentinelRef: HTMLElement } | null>(null)
const isSearching = ref(false)

// 分页逻辑
const {
  list: filteredPosts,
  isLoading,
  isInitialLoad,
  hasMore,
  sentinelRef,
  loadData,
  initObserver
} = usePagination((page) => postStore.fetchPosts({
  page,
  pageSize: 8,
  keyword: query.value
}))

watch(() => resultsComponentRef.value?.sentinelRef, (el) => {
  if (el) sentinelRef.value = el
})

// 防抖搜索
let debounceTimer: any
watch(query, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (!newVal.trim()) {
    filteredPosts.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  debounceTimer = setTimeout(async () => {
    await loadData(true) // 重置并搜索
    isSearching.value = false
    // 数据加载后重新初始化观察器
    nextTick(() => initObserver())
  }, 500)
})

// 监听打开状态，处理进场动画
watch(() => themeStore.searchOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      // 聚焦输入框
      inputComponentRef.value?.focusInput()

      const tl = gsap.timeline()
      tl.set(overlayRef.value, { opacity: 0 })
        .to(overlayRef.value, { opacity: 1, duration: 0.4 })
        .fromTo('.search-input',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.2"
        )
    })
  }
})

// 关闭与离场动画
const closeSearch = () => {
  const tl = gsap.timeline({
    onComplete: () => {
      themeStore.toggleSearch(false)
      query.value = ''
      filteredPosts.value = []
    }
  })

  if (filteredPosts.value.length > 0) {
    tl.to('.search-result-item', { y: 20, opacity: 0, stagger: 0.05, duration: 0.3 })
  }

  tl.to('.search-input', { y: 20, opacity: 0, duration: 0.3 }, "-=0.2")
    .to(overlayRef.value, { opacity: 0, duration: 0.4 })
}

const goToArticle = (id: number) => {
  if (window.innerWidth < 768) {
    closeSearch()
  }
   articleModalStore.open(id)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && themeStore.searchOpen) closeSearch()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="themeStore.searchOpen" ref="overlayRef" class="search-overlay" data-lenis-prevent>
      <div class="backdrop" @click="closeSearch"></div>

      <div class="search-container">
        <SearchInput ref="inputComponentRef" v-model="query" @close="closeSearch" />

        <SearchResults ref="resultsComponentRef" :results="filteredPosts" :query="query" :is-loading="isLoading"
          :is-searching="isSearching" :is-initial-load="isInitialLoad" @navigate="goToArticle" />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--mask-bg);
  backdrop-filter: blur(20px);
  z-index: -1;
  transition: background-color 0.4s ease;
}

.search-container {
  width: 100%;
  max-width: 800px;
  padding: 0 5vw 100px 5vw;
  position: relative;
  z-index: 1;
}
</style>
