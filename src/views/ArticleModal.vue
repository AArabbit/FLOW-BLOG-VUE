<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted, inject, type Ref, shallowRef, provide } from 'vue'
import Lenis from 'lenis'
import { usePostStore } from '@/stores/posts'
import type { Post } from '@/types'
import { PhX } from "@phosphor-icons/vue"
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import ArticleDetail from '@/components/article/ArticleDetail.vue'

const props = defineProps<{
  modelValue: boolean
  postId: number | null
}>()

const emit = defineEmits(['update:modelValue', 'close'])
const postStore = usePostStore()
const post = ref<Post | undefined>(undefined)
const isLoading = ref(true)

// DOM Refs
const scrollContainerRef = ref<HTMLElement | null>(null) // Wrapper
const contentRef = ref<HTMLElement | null>(null)         // Content
const articleDetailRef = ref<any>(null)

// 注入全局 Lenis
const globalLenis = inject<Ref<Lenis | null>>('globalLenis')

// 局部 Lenis
let localLenis = shallowRef<Lenis | null>(null)
provide('localLenis', localLenis)

const alignPixelWidth = () => {
  if (!scrollContainerRef.value) return
  
  // 先重置宽度
  scrollContainerRef.value.style.width = '90vw' 
  const rect = scrollContainerRef.value.getBoundingClientRect()
  const evenWidth = Math.floor(rect.width / 2) * 2
  scrollContainerRef.value.style.width = `${evenWidth}px`
}

// 监听窗口大小变化，保持像素对齐
const resizeObserver = new ResizeObserver(() => {
  alignPixelWidth()
})

const initLocalLenis = () => {
  if (!scrollContainerRef.value || !contentRef.value) return

  // 1. 先进行像素对齐，防止初始化时模糊
  alignPixelWidth()
  resizeObserver.observe(document.body)

  // 2. 初始化局部 Lenis v2
  localLenis.value = new Lenis({
    wrapper: scrollContainerRef.value, // 滚动容器
    content: contentRef.value,         // [v2建议] 显式指定内容层
    duration: 1.2,
    // prevent: true, // 阻止事件冒泡，防止触发外层（虽然我们已经stop了外层，加这个更保险）
    autoRaf: true, // 局部实例也自动 RAF
  })
}

const destroyLocalLenis = () => {
  resizeObserver.disconnect()
  if (localLenis.value) {
    localLenis.value.destroy()
    localLenis.value = null
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
  window.history.pushState({}, '', '/')
}

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    // A. 打开时：暂停全局 Lenis，锁定 body
    globalLenis?.value?.stop()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    if (props.postId) {
      if (post.value && post.value.id === props.postId) {
        await nextTick()
        initView()
      } else {
        await loadPost(props.postId)
      }
    }
  } else {
    // B. 关闭时：恢复全局 Lenis，解锁 body
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    destroyLocalLenis()
    globalLenis?.value?.start()
  }
})

const loadPost = async (id: number) => {
  isLoading.value = true
  try {
    const data = await postStore.fetchPostDetail(id)
    post.value = data
  } catch (error) {
    console.error("Failed to load post", error)
  } finally {
    isLoading.value = false
    await nextTick()
    initView()
  }
}

const initView = async () => {
  initLocalLenis() // 启动局部滚动

  if (articleDetailRef.value) {
    articleDetailRef.value.initAnimations()
    setTimeout(() => {
      articleDetailRef.value.initTOC()
    }, 200)
  }
}

const handleContentRendered = () => {
  if (localLenis.value) localLenis.value.resize()
}

onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  destroyLocalLenis()
  // 确保组件销毁时恢复全局滚动
  globalLenis?.value?.start()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-mask" @click.self="closeModal">
        <div class="modal-wrapper">
          <button class="close-btn" @click="closeModal">
            <PhX />
          </button>

          <div class="modal-container">
            <!-- 
               Lenis Wrapper 
               注意：data-lenis-prevent 在这里不需要了，因为我们手动 new 了一个实例
            -->
            <div class="modal-scroll-area" ref="scrollContainerRef">

              <!-- 
                 Lenis Content 
                 必须包裹一个 div 作为 content 
              -->
              <div class="modal-lenis-content" ref="contentRef">
                <div v-if="isLoading" class="skeleton-padding">
                  <SkeletonCard />
                </div>

                <div v-else-if="post" class="modal-body">
                  <!-- 复用组件 -->
                  <ArticleDetail 
                    ref="articleDetailRef" 
                    :post="post" 
                    :scroll-element="scrollContainerRef" 
                    :is-modal="true"
                    @content-rendered="handleContentRendered" 
                  />
                </div>
              </div>
              <!-- Content End -->

            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_variables.scss" as *;
@use "@/assets/styles/_mixins.scss" as *;

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  // align-items: center;
  // justify-content: center;
  transition: all 0.4s ease;
  overflow: hidden; /* 既然有 lenis，mask 本身不该滚动 */
}

.modal-wrapper {
  position: relative;
  margin: auto; 
  width: 90vw;
  height: 90vh;
  max-width: 1400px;
  /* 强制硬件加速层，配合 JS 的像素对齐，可以极大缓解模糊 */
  transform: translateZ(0); 
  backface-visibility: hidden;
}

.modal-container {
  width: 100%;
  height: 100%;
  background: var(--bg-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

   /* [修复模糊] 字体平滑设置 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  transform: none !important; 
  will-change: auto !important;
  isolation: isolate;
}

.dark .modal-container {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.modal-scroll-area {
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* 恢复默认光标 */
  cursor: default;

  /* 防止滚动穿透 */
  overscroll-behavior: contain;
}

.modal-lenis-content {
  /* 
    [修复模糊] 
    确保内容层也有独立的合成层，防止重绘抖动 
  */
  will-change: transform;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 24px;
  left: auto;
  /* 重置 left */

  z-index: 100;
  width: 38px;
  height: 38px;
  border-radius: 50%;

  /* 磨砂玻璃风格 */
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #000;
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  @include mobile {
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.4);
  }
}

.modal-body {
  min-height: 100%;
  position: relative;
}


.skeleton-padding {
  padding: 80px 5vw;
}

.content-wrapper {
  /* 调整内容区域的间距 */
  padding: 40px 5vw 80px;
  background: var(--bg-color);
}

.modal-content-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 60px;
  align-items: stretch;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.right-column {
  position: relative;
  height: 100%;
}

.error-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease;

  .modal-wrapper {
    // transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
     transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-wrapper {
    /* [修复模糊] 不要使用 scale(0.96)，直接位移 */
    transform: translateY(40px);
    opacity: 0;
  }
}
</style>