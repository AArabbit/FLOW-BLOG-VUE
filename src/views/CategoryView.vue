<script setup lang="ts">
import { computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NGrid, NGridItem, NEmpty } from 'naive-ui'
import gsap from 'gsap'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { usePagination } from '@/utils/usePagination'
import PostCard from '@/components/common/PostCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 必须显式声明组件名称，供 KeepAlive 缓存使用
defineOptions({
  name: 'CategoryView'
})

const route = useRoute()
const postStore = usePostStore()
const themeStore = useThemeStore()

// 直接计算当前分类ID
const currentCategoryId = computed(() => Number(route.params.id))
const currentCategory = computed(() => postStore.categories.find(c => c.id === currentCategoryId.value))

// 分页 Hook
const {
  list: posts,
  isLoading,
  isInitialLoad,
  hasMore,
  sentinelRef,
  loadData,
  initObserver
} = usePagination((page) => postStore.fetchPosts({
  page,
  pageSize: 9,
  categoryId: currentCategoryId.value
}))

// 动画逻辑
const animateNewItems = () => {
  gsap.fromTo('.anim-card:not(.animated)',
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
      onComplete: function () {
        (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated'))
      }
    }
  )
}

// 监听数据长度变化 (用于分页加载更多时的动画)
watch(() => posts.value.length, () => nextTick(animateNewItems))

onMounted(async () => {
  // 确保滚动位置重置
  window.scrollTo({ top: 0, behavior: 'instant' })

  // 加载数据
  await loadData(true)
  initObserver()

  // 3. 头部文字进场动画
  gsap.fromTo('.anim-element',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
  )
})
</script>

<template>
  <div class="view-container section-padding" style="margin-top: 80px;">

    <div class="category-header">
      <h1 class="page-title anim-element" :style="{ color: themeStore.themeColor }">
        分类: {{ currentCategory?.name || '未知' }}
      </h1>
      <p class="category-desc anim-element">
        收录关于 {{ currentCategory?.name }} 的思考与沉淀。
      </p>
    </div>

    <n-grid x-gap="32" y-gap="32" cols="1 s:1 m:2 l:3" responsive="screen">
      <template v-if="isInitialLoad">
        <n-grid-item v-for="n in 6" :key="`s-${n}`">
          <SkeletonCard />
        </n-grid-item>
      </template>

      <template v-else>
        <n-grid-item v-for="post in posts" :key="post.id" class="anim-card">
          <PostCard :post="post" />
        </n-grid-item>
      </template>
    </n-grid>

    <div v-if="!isInitialLoad && posts.length === 0" class="empty-state">
      <n-empty description="该分类下暂无文章" size="large" />
    </div>

    <div ref="sentinelRef" class="sentinel">
      <LoadingSpinner v-if="isLoading && !isInitialLoad" size="small" />
      <span v-if="!hasMore && !isInitialLoad && posts.length > 0" class="no-more">End of content</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.category-header {
  margin-bottom: 60px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 40px;

  .page-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin-bottom: 16px;
    font-weight: 700;
    transition: color 0.3s;
  }

  .category-desc {
    font-size: 1.1rem;
    color: var(--text-sub);
    font-family: 'Space Grotesk';
    max-width: 600px;
    line-height: 1.6;
  }
}

.empty-state {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.sentinel {
  height: 80px;
  @include flex(center, center);
  width: 100%;
  margin-top: 20px;
}

.no-more {
  color: var(--text-sub);
  font-size: 0.9rem;
  font-family: $font-main;
  opacity: 0.6;
}
</style>
