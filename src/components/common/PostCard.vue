<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from '@/types'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useBookmarkStore } from '@/stores/bookmarks'
import { PhHeart, PhEye } from "@phosphor-icons/vue";

const props = withDefaults(defineProps<{
  post: Post
  showDefaultAction?: boolean
}>(), {
  showDefaultAction: true
})

const emit = defineEmits<{
  (e: 'click-post', post: Post): void
}>()

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()

// 3D交互
const cardRef = ref<HTMLElement | null>(null)
const cardBodyRef = ref<HTMLElement | null>(null)
let rafId: number | null = null
let isHovering = false

// 鼠标进入 
const handleMouseEnter = () => {
  if (!cardBodyRef.value) return
  isHovering = true

  // 进入时，移除transition
  cardBodyRef.value.style.transition = 'none'
}

// 鼠标移动  
const handleMouseMove = (e: MouseEvent) => {
  if (!isHovering || !cardBodyRef.value || !cardRef.value) return

  if (rafId) return // 节流  

  rafId = requestAnimationFrame(() => {
    if (!cardBodyRef.value || !cardRef.value) return

    // 获取卡片几何信息  
    const rect = cardRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // 计算鼠标相对中心的偏移  
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    // 计算旋转角度
    const rotateX = (mouseY / rect.height) * -28
    const rotateY = (mouseX / rect.width) * 28

    // 设置CSS变量 
    cardBodyRef.value.style.setProperty('--rx', `${rotateX}deg`)
    cardBodyRef.value.style.setProperty('--ry', `${rotateY}deg`)

    rafId = null
  })
}

// 鼠标离开  
const handleMouseLeave = () => {
  if (!cardBodyRef.value) return
  isHovering = false

  // 恢复transition  
  cardBodyRef.value.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease'

  // 归零变量  
  cardBodyRef.value.style.setProperty('--rx', '0deg')
  cardBodyRef.value.style.setProperty('--ry', '0deg')

  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

const navigateToPost = () => {
  // router.push(`/article/${props.post.id}`)
  emit('click-post', props.post)
}

const handleBookmark = async (e: Event) => {
  e.stopPropagation()
  await bookmarkStore.toggleBookmark(props.post.id)
}  
</script>

<template>
  <div class="card-container-3d" ref="cardRef" @mouseenter="handleMouseEnter" @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave" @click="navigateToPost">

    <div class="card-body-3d" ref="cardBodyRef">

      <!-- 图片层 -->
      <div class="card-item-3d image-group" style="--depth: 44px">
        <div class="image-wrapper">
          <img :src="props.post.cover" class="card-image" alt="Cover" loading="lazy" />
          <div class="card-category">{{ props.post.category.name }}</div>

          <button v-if="showDefaultAction && authStore.user" class="bookmark-btn" style="--depth: 20px"
            :class="{ active: bookmarkStore.isBookmarked(post.id) }" @click="handleBookmark"
            :disabled="bookmarkStore.isBookmarkLoading(post.id)">
            <div v-if="bookmarkStore.isBookmarkLoading(post.id)" class="btn-spinner"></div>
            <PhHeart v-else :weight="bookmarkStore.isBookmarked(post.id) ? 'fill' : 'regular'" />
          </button>
        </div>
      </div>

      <!-- 标题层 -->
      <div class="card-item-3d title-group" style="--depth: 30px">
        <div class="card-meta">
          <span class="meta-item">{{ props.post.date }}</span>
          <span class="dot">·</span>
          <span class="meta-item"><PhEye /> {{ props.post.views }}</span>
        </div>
        <h3 class="card-title">
          {{ props.post.title }}
        </h3>
      </div>

      <!-- 描述层 -->
      <div class="card-item-3d desc-group" style="--depth: 20px">
        <p class="card-desc">
          {{ props.post.desc.substring(0, 50) }}...
        </p>
      </div>

      <!-- 底部 -->
      <div class="card-item-3d footer-group" style="--depth: 10px">
        <div class="card-footer">
          <div v-if="props.post.author" class="author-info">
            <img :src="props.post.author.avatar" class="author-avatar" alt="avatar" loading="lazy" />
            <span class="author-name">{{ props.post.author.username }}</span>
          </div>
          <span class="read-more" :style="{ color: themeStore.themeColor }">
            阅读
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.card-container-3d {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  perspective: 1000px;
  cursor: pointer;
  padding: 10px;
  -webkit-tap-highlight-color: transparent;
}

.card-body-3d {
  // 定义 CSS 变量默认值  
  --rx: 0deg;
  --ry: 0deg;

  background: var(--card-bg);
  padding: 20px;
  border-radius: 20px;
  position: relative;

  // 开启3D 
  transform-style: preserve-3d;

  // 绑定CSS变量  
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease;

  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
  gap: 16px;

  // 只有Hover时才分配GPU
  .card-container-3d:hover & {
    will-change: transform;
    box-shadow:
      0 20px 40px -20px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}

.card-item-3d,
.bookmark-btn {
  width: 100%;
  --tz: 0px;
  transform-style: preserve-3d;

  // 绑定变量  
  transform: translateZ(var(--tz));
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);

  .card-container-3d:hover & {
    --tz: var(--depth, 0px);
  }

  .card-desc {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
  }
}

.bookmark-btn {
  width: 32px;
  position: absolute;
  top: 12px;
  right: 12px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #999;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, color 0.2s, box-shadow 0.3s;

  &:hover {
    color: #d00000;
    box-shadow: 0 5px 15px rgba(208, 0, 0, 0.15);
    transform: translateZ(var(--tz)) scale(1.1);
  }

  &.active {
    color: #d00000;
  }
}

// --- 图片部分 ---  
.image-wrapper {
  width: 100%;
  aspect-ratio: 16/10;
  border-radius: 12px;
  position: relative;
  background-color: rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
  pointer-events: none;
}

.card-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #000;
  padding: 4px 10px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  border-radius: 6px;
  z-index: 2;
  transform: translateZ(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// --- 文字样式 ---  
.card-meta {
  font-size: 0.75rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: 'Space Grotesk', sans-serif;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.35;
  margin: 0;
  @include text-clamp(2);
}

.card-desc {
  font-size: 0.9rem;
  color: var(--text-sub);
  line-height: 1.6;
  opacity: 0.8;
  margin: 0;
  @include text-clamp(2);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  width: 100%;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .author-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }

  .author-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
  }
}

.read-more {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #eee;
  border-top-color: #d00000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
