<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import { useHead } from '@vueuse/head'
import { usePostStore } from '@/stores/posts'
import type { Post } from '@/types'

// 组件引入
import ArticleHero from '@/components/article/ArticleHero.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleTOC from '@/components/article/ArticleTOC.vue'
import CommentSection from '@/components/article/CommentSection.vue'

const route = useRoute()
const postStore = usePostStore()

// 状态改为 Ref，用于存储异步获取的数据
const post = ref<Post | undefined>(undefined)
const isLoading = ref(true)

// computed 会自动追踪 post.value 的变化
useHead({
  title: computed(() => post.value ? `${post.value.title} - MIND FLOW` : 'Loading...'),
  meta: [
    { name: 'description', content: computed(() => post.value?.desc || '') },
    { name: 'keywords', content: computed(() => post.value?.category.name || 'Blog') }
  ]
})

// Lifecycle
onMounted(async () => {
  window.scrollTo(0, 0)

  const id = Number(route.params.id)

  // 真实模拟异步请求
  try {
    isLoading.value = true
    const data = await postStore.fetchPostDetail(id)
    post.value = data
  } catch (error) {
    console.error("Failed to load post", error)
  } finally {
    isLoading.value = false
  }

  // 数据加载完成，DOM 更新后，执行进场动画和 TOC 初始化
  if (post.value) {
    await nextTick()

    // 进场动画
    const tl = gsap.timeline()
    tl.from('.article-hero', { scale: 1.02, opacity: 0, duration: 1.2, ease: "power2.out" })
      .from('.content-layout', { y: 30, opacity: 0, duration: 0.8 }, "-=0.8")
  }
})
</script>

<template>
  <div class="view-container">
    <div v-if="isLoading" class="skeleton-wrapper">
      <div class="skeleton-hero skeleton-anim"></div>
      <div class="skeleton-body section-padding">
        <div class="skeleton-layout">
          <div class="skeleton-main">
            <div class="s-line title skeleton-anim"></div>
            <div class="s-line desc skeleton-anim"></div>
            <div class="s-line desc w-80 skeleton-anim"></div>
            <div class="s-divider skeleton-anim"></div>
            <div class="s-line p skeleton-anim"></div>
            <div class="s-line p skeleton-anim"></div>
            <div class="s-line p w-60 skeleton-anim"></div>
          </div>
          <div class="skeleton-sidebar skeleton-anim"></div>
        </div>
      </div>
    </div>

    <div v-else-if="post">
      <ArticleHero :post="post" />

      <div class="content-wrapper">
        <div class="content-layout">

          <div class="left-column">
            <ArticleContent :post="post" />
            <CommentSection :post-id="post.id" />
          </div>

          <ArticleTOC />

        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <h2>文章不存在</h2>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.content-wrapper {
  background: var(--bg-color);
  padding: 80px 5vw;
  transition: background-color 0.4s ease;
}

.content-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 60px;
  align-items: start;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.left-column {
  min-width: 0;
}

.error-state {
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
}

.skeleton-hero {
  height: 60vh;
  width: 100%;
  background: var(--card-bg);
  margin-top: 80px;
}

.skeleton-body {
  background: var(--bg-color);
}

.skeleton-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 60px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.s-line {
  height: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 15px;

  &.title {
    height: 60px;
    width: 70%;
    margin-bottom: 30px;
  }

  &.desc {
    height: 24px;
  }

  &.p {
    height: 16px;
    margin-bottom: 12px;
  }

  &.w-80 {
    width: 80%;
  }

  &.w-60 {
    width: 60%;
  }
}

.s-divider {
  height: 4px;
  width: 60px;
  margin: 40px 0;
  background: rgba(0, 0, 0, 0.05);
}

.skeleton-sidebar {
  height: 300px;
  width: 100%;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;

  @include mobile {
    display: none;
  }
}

.skeleton-anim {
  background: linear-gradient(90deg, var(--card-bg) 25%, rgba(150, 150, 150, 0.05) 37%, var(--card-bg) 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
