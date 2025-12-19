<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { enhanceCodeBlocks } from '@/utils/dom/code-block'
import '@/assets/styles/markdown-custom.scss'
import ArticleSkeleton from './ArticleSkeleton.vue'

const props = defineProps<{ post: any }>()
const emit = defineEmits<{ (e: 'content-rendered'): void }>()
const router = useRouter()
const themeStore = useThemeStore()

const previewRef = ref<HTMLDivElement | null>(null)

// 动画状态控制
const isRendering = ref(true) 
const isVisible = ref(false)

const renderContent = async () => {

  isVisible.value = false
  isRendering.value = true
  if (previewRef.value) previewRef.value.innerHTML = ''
  
  if (!props.post.content) return

  await new Promise(resolve => setTimeout(resolve, 300))
  await nextTick()
  
  if (!previewRef.value) return

  const isDark = document.documentElement.classList.contains('dark') || themeStore.isDark

  try {
    // 3. 渲染 Vditor
    await Vditor.preview(previewRef.value, props.post.content, {
      cdn: '/vditor', 
      mode: isDark ? 'dark' : 'light',
      theme: { current: isDark ? 'dark' : 'light' },
      hljs: { style: isDark ? 'native' : 'github', lineNumber: false }
    })
    
    // 代码高亮增强
    if (previewRef.value) {
      enhanceCodeBlocks(previewRef.value)
    }

    // 5. 关闭骨架屏
    isRendering.value = false

    setTimeout(() => {
      isVisible.value = true
      // 这里的 emit 非常重要，它通知 ArticleModal 去调用 initTOC
      nextTick(() => {
        emit('content-rendered')
      })
    }, 50)

  } catch (error) {
    console.error('Vditor render failed:', error)
    isRendering.value = false
    isVisible.value = true 
  }
}

// 监听 ID 变化
watch(() => props.post.id, (newId, oldId) => {
  if (newId !== oldId) {
    renderContent()
  }
})

watch(() => themeStore.isDark, renderContent)

// 生命周期
onMounted(() => {
  renderContent()
})

onBeforeUnmount(() => {
  if (previewRef.value) {
    previewRef.value.innerHTML = ''
  }
})
</script>

<template>
  <article class="article-main">
    <p class="lead">{{ post.desc }}</p>
    <div class="divider"></div>

    <div class="content-area">
      <Transition name="fade-skeleton">
        <ArticleSkeleton v-if="isRendering" />
      </Transition>

      <div class="viewer-container" :class="{ 'is-visible': isVisible }">
        <!-- 增加 key 强制 DOM 刷新 -->
        <div ref="previewRef" :key="post.id" class="vditor-reset markdown-body"></div>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;800&display=swap');

.article-main {
  .lead {
    font-size: 1.15rem;
    font-weight: 500;
    margin-bottom: 30px;
    color: var(--text-main);
    line-height: 1.6;
    opacity: 0.8;
    cursor: text;
    /* 移动端字体 */
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 20px;
    }
  }

  .divider {
    width: 60px;
    height: 3px;
    background: var(--primary-color);
    margin: 30px 0 50px;
     
    /* 移动端分隔线 */
    @media (max-width: 768px) {
      margin: 20px 0 30px;
    }
  }
}

.content-area {
  position: relative;
  min-height: 600px; // 保持高度占位
}

/* 骨架屏离场动画 (Vue Transition) --- */
.fade-skeleton-leave-active {
  transition: opacity 0.5s ease;
}

.fade-skeleton-leave-to {
  opacity: 0;
}

/* 正文进场动画 (CSS Class) --- */
.viewer-container {
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(20px);
  filter: blur(5px);
  transition:
    opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 1s cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 0.8s ease;
  will-change: transform, opacity;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }

  :deep(.vditor-reset) {
    color: var(--text-main);
    background-color: transparent;
    padding: 0 !important;
    min-height: 200px;
  }
}

.article-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border-light);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.6s ease;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.2s;
  }
}
</style>