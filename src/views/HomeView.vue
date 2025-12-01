<script setup lang="ts">
import { onMounted, ref, nextTick, watch } from 'vue'
import { NGrid, NGridItem } from 'naive-ui'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useHead } from '@vueuse/head'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { usePagination } from '@/utils/usePagination' // 引入 hook
import PostCard from '@/components/common/PostCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineOptions({ name: 'HomeView' })

gsap.registerPlugin(ScrollTrigger)

const postStore = usePostStore()
const themeStore = useThemeStore()
const heroTitle = ref<HTMLElement | null>(null)

useHead({ title: '首页 | FLOW BLOG' })

// 使用分页 Hook
const {
  list: posts,
  isLoading,
  isInitialLoad,
  hasMore,
  sentinelRef,
  loadData,
  initObserver
} = usePagination((page) => postStore.fetchPosts({ page, pageSize: 9 }))

onMounted(async () => {
  // 初始加载
  await loadData()

  // 启动无限滚动监听
  initObserver()

  // Hero 动画
  nextTick(() => {
    gsap.from(heroTitle.value, { y: 100, opacity: 0, duration: 1.2, ease: "power4.out", delay: 0.2 })
    // 对初始加载的卡片执行进场动画
    animateNewItems()
  })
})

// 动画触发器
const animateNewItems = () => {
  gsap.fromTo('.featured-item:not(.animated)', { y: 50, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
    onComplete: function () { (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated')) }
  })
}

// 监听列表长度变化触发后续页的动画
watch(() => posts.value.length, () => nextTick(animateNewItems))

</script>

<template>
  <div class="view-container">
    <section class="hero">
      <h1 class="hero-title" ref="heroTitle">
        探索思维<br><span :style="{ color: themeStore.themeColor }">无界</span> 的数字荒原
      </h1>
      <p class="hero-subtitle">设计 · 编码 · 思考</p>
    </section>

    <section class="featured">
      <div class="section-header">
        <h2>最新文章</h2><span class="line"></span>
      </div>

      <n-grid x-gap="32" y-gap="40" cols="1 s:1 m:2 l:3" responsive="screen">
        <n-grid-item v-for="post in posts" :key="post.id" class="featured-item">
          <PostCard :post="post" />
        </n-grid-item>

        <template v-if="isInitialLoad">
          <n-grid-item v-for="n in 6" :key="`s-${n}`">
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

.hero {
  @include section-padding;
  padding-top: 180px;
  padding-bottom: 100px;
}

.hero-title {
  font-size: clamp(3.5rem, 8vw, 7.5rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-main);
  margin-bottom: 2rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-sub);
  font-family: 'Space Grotesk';
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.featured {
  @include section-padding;
  padding-top: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 60px;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .line {
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }
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
