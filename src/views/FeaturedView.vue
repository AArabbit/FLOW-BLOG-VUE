<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { usePostStore } from '@/stores/posts'
import { usePagination } from '@/utils/usePagination'
import type { Post } from '@/types'

// 组件引入
import FeaturedSpotlight from '@/components/featured/FeaturedSpotlight.vue'
import FeaturedList from '@/components/featured/FeaturedList.vue'
import FeaturedCursor from '@/components/featured/FeaturedCursor.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineOptions({ name: 'FeaturedView' })

const postStore = usePostStore()

// 使用分页 Hook
const {
  list: listPosts, isLoading, isInitialLoad, hasMore, sentinelRef, loadData, initObserver
} = usePagination((page) => postStore.fetchPosts({ page, pageSize: 10 }))

const spotlightPost = computed(() => postStore.posts[0])

// 鼠标跟随，异步预览逻辑
const cursorComponentRef = ref<{ rootRef: HTMLElement } | null>(null)
const activePreviewText = ref('')
const activeCategory = ref('')
const isPreviewLoading = ref(false) // 预览框加载状态

// 用于解决竞态问题：记录当前 Hover 的 ID
let currentHoverToken = 0

// GSAP quickTo
const xTo = ref<any>(null)
const yTo = ref<any>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (xTo.value) {
    xTo.value(e.clientX + 30)
    yTo.value(e.clientY)
  }
}

const onListHover = async (post: Post) => {
  const token = post.id
  currentHoverToken = token // 标记当前 Hover 的目标

  // 立即显示悬浮框
  if (cursorComponentRef.value?.rootRef) {
    gsap.to(cursorComponentRef.value.rootRef, {
      scale: 1, opacity: 1, duration: 0.4, ease: "power2.out", overwrite: 'auto'
    })
  }

  // 进入加载状态
  isPreviewLoading.value = true
  activePreviewText.value = '' // 清空旧内容，避免闪烁
  activeCategory.value = ''

  // 模拟后端请求 (随机延迟 300ms - 800ms)
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))

  // 只有当用户仍然 Hover 在同一个元素上时，才更新内容
  if (currentHoverToken === token) {
    // 模拟从后端获取到了更详细的摘要
    activePreviewText.value = post.desc
    activeCategory.value = post.category.name
    isPreviewLoading.value = false
  }
}

const onListLeave = () => {
  currentHoverToken = 0 // 清除标记

  if (cursorComponentRef.value?.rootRef) {
    gsap.to(cursorComponentRef.value.rootRef, {
      scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", overwrite: 'auto'
    })
  }
}

onMounted(async () => {
  await loadData(true)
  initObserver()

  // 初始化跟随逻辑
  const cursorEl = cursorComponentRef.value?.rootRef
  if (cursorEl) {
    gsap.set(cursorEl, { xPercent: 0, yPercent: -50 })
    xTo.value = gsap.quickTo(cursorEl, "x", { duration: 0.5, ease: "power3" })
    yTo.value = gsap.quickTo(cursorEl, "y", { duration: 0.5, ease: "power3" })
  }

  // 进场动画
  nextTick(() => {
    const tl = gsap.timeline()
    if (document.querySelector('.spotlight-img')) tl.from('.spotlight-img', { scale: 1.1, opacity: 0, duration: 1.2, ease: "power2.out" })
    if (document.querySelector('.spotlight-content')) tl.from('.spotlight-content', { x: 50, opacity: 0, duration: 1 }, "-=0.8")
  })
})

watch(() => listPosts.value.length, () => {
  nextTick(() => {
    gsap.fromTo('.list-row:not(.animated)',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power2.out", clearProps: "all", onComplete: function () { (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated')) } }
    )
  })
})
</script>

<template>
  <div class="view-container" @mousemove="handleMouseMove">

    <div v-if="isInitialLoad" class="loading-container">
      <LoadingSpinner size="large" />
    </div>

    <template v-else>
      <FeaturedSpotlight v-if="spotlightPost" :post="spotlightPost" />

      <FeaturedList :posts="listPosts" @item-hover="onListHover" @item-leave="onListLeave" />

      <div ref="sentinelRef" class="sentinel">
        <LoadingSpinner v-if="isLoading" size="small" />
      </div>

      <FeaturedCursor ref="cursorComponentRef" :text="activePreviewText" :category="activeCategory"
        :is-loading="isPreviewLoading" />
    </template>

  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.loading-container {
  min-height: 80vh;
  @include flex(center, center);
}

.sentinel {
  height: 80px;
  @include flex(center, center);
  width: 100%;
  margin-top: 20px;
}
</style>
