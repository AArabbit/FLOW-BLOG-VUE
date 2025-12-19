<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import type { Post } from '@/types'

import ArticleHero from '@/components/article/ArticleHero.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleTOC from '@/components/article/ArticleTOC.vue'
import CommentSection from '@/components/article/CommentSection.vue'

const props = defineProps<{
  post: Post
  scrollElement?: HTMLElement | null // 如果是弹窗，传入滚动容器；如果是独立页，传null
  isModal?: boolean // 用于控制样式差异
}>()

const emit = defineEmits(['content-rendered'])

// Refs
const heroRef = ref<HTMLElement | null>(null)
const contentLayoutRef = ref<HTMLElement | null>(null)
const tocRef = ref<any>(null)

// 进场动画 (供父组件调用)
const initAnimations = () => {
  if (!heroRef.value || !contentLayoutRef.value) return
  
  // 清理旧动画
  gsap.killTweensOf([heroRef.value, contentLayoutRef.value])
  
  const tl = gsap.timeline()
  
  tl.fromTo(heroRef.value, 
    { scale: 1.05, opacity: 0 },
    { scale: 1, opacity: 1, duration: 1, ease: "power3.out", clearProps: 'all' }
  )
  .fromTo(contentLayoutRef.value,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", clearProps: 'all' }, 
    "-=0.6"
  )
}

// 初始化 TOC (供父组件调用)
const initTOC = () => {
  if (tocRef.value) tocRef.value.initTOC()
}

// 内容渲染回调
const handleContentRendered = () => {
  emit('content-rendered')
  initTOC()
}

// 暴露给父组件
defineExpose({
  initAnimations,
  initTOC
})
</script>

<template>
  <div class="article-detail-container" :class="{ 'is-modal': isModal }">
    
    <!-- 头部 -->
    <div class="hero-wrapper" ref="heroRef">
      <ArticleHero :post="post" />
    </div>

    <!-- 内容布局 -->
    <div class="content-wrapper">
      <div class="content-layout" ref="contentLayoutRef">
        
        <div class="left-column">
          <ArticleContent 
            :post="post" 
            :key="post.id"
            @content-rendered="handleContentRendered" 
          />
          <CommentSection :post-id="post.id" />
        </div>
        
        <div class="right-column">
          <ArticleTOC ref="tocRef" :scroll-element="scrollElement" />
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.hero-wrapper {
  width: 100%;
  position: relative;
  
  // 默认（独立页）样式
  :deep(.article-hero) {
    height: 60vh; 
    margin-top: 80px; // 避开导航栏
  }
}

.content-wrapper {
  padding: 40px 5vw 80px;
  background: var(--bg-color);
}

.content-layout {
  max-width: 1200px;
  display: grid;
  // grid-template-columns: 1fr 260px;
  grid-template-columns: minmax(0, 1fr) 240px; 
  gap: 40px;
  align-items: stretch;
  /* 移动端变为单列 */
  @include mobile {
    grid-template-columns: 1fr; // 强制单列
    gap: 0;
    display: block;
  }
  
}

.right-column {
  position: relative;
  height: 100%;
}

/* --- 弹窗模式下的样式覆盖 --- */
.article-detail-container.is-modal {
  .hero-wrapper {
    :deep(.article-hero) {
      height: 38vh; 
      min-height: 320px;
      margin-top: 0 !important; 
    }
    
    :deep(.article-title) {
      font-size: clamp(1.8rem, 4vw, 2.8rem); 
    }
  }
}
</style>