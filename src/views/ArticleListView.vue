<script setup lang="ts">
import { onMounted, nextTick, watch } from 'vue'
import { NGrid, NGridItem } from 'naive-ui'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useHead } from '@vueuse/head'
import { usePostStore } from '@/stores/posts'
import { useArticleModalStore } from '@/stores/articleModal'
import PostCard from '@/components/common/PostCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { usePagination } from '@/utils/usePagination'
import { Post } from '@/types'

defineOptions({ name: 'ArticleListView' })

gsap.registerPlugin(ScrollTrigger)

const postStore = usePostStore()
const articleModalStore = useArticleModalStore()

useHead({ title: '文章列表 | FLOW BLOG' })

const handleOpenPost = (post: Post) => {
  articleModalStore.open(post.id)
}

// 分页 Hook
const {
  list: posts,
  isLoading,
  isInitialLoad,
  hasMore,
  sentinelRef,
  loadData,
  initObserver
} = usePagination((page) => postStore.fetchPosts({ page, pageSize: 12 }), { animationClass: 'featured-item' })

onMounted(async () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  await loadData()
  initObserver()
  nextTick(() => animateNewItems())
})

const animateNewItems = () => {
  gsap.fromTo('.featured-item:not(.animated)',
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      onComplete: function () {
        (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated'))
      }
    }
  )
}

watch(() => posts.value.length, () => nextTick(animateNewItems))
</script>

<template>
  <div class="view-container">
    <section class="featured">
      <div class="section-header">
        <h2>全部文章</h2><span class="line"></span>
      </div>

      <n-grid x-gap="0" y-gap="20" cols="1 s:1 m:2 l:3 xl:4" responsive="screen">
        <n-grid-item v-for="post in posts" :key="post.id" class="featured-item">
         
          <PostCard :post="post" @click-post="handleOpenPost" />
        </n-grid-item>

        <template v-if="isInitialLoad">
          <n-grid-item v-for="n in 8" :key="`s-${n}`">
            <SkeletonCard />
          </n-grid-item>
        </template>

      </n-grid>

      <div ref="sentinelRef" class="sentinel">
        <LoadingSpinner v-if="isLoading && !isInitialLoad" size="small" />
        <span v-if="!hasMore && !isInitialLoad" class="no-more">没有更多内容了</span>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.view-container {
  min-height: 100vh;
}

.featured {
  @include section-padding;
  padding-top: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap
  }

  .line {
    flex: 1;
    height: 1px;
    background: var(--border-light);
    opacity: 0.6
  }
}

.sentinel {
  height: 80px;
  @include flex(center, center);
  width: 100%;
  margin-top: 20px
}

.no-more {
  color: var(--text-sub);
  font-size: 0.9rem;
  font-family: $font-main;
  opacity: 0.6
}
</style>
