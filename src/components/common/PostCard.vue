<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Post } from '@/types'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useBookmarkStore } from '@/stores/bookmarks'

const props = defineProps<{
  post: Post
}>()

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()

const navigateToPost = () => {
  router.push(`/article/${props.post.id}`)
}

const handleBookmark = async (e: Event) => {
  e.stopPropagation()
  await bookmarkStore.toggleBookmark(props.post.id)
}
</script>

<template>
  <div class="post-card" @click="navigateToPost">
    <div class="card-image-wrapper">
      <img :src="props.post.cover" class="card-image" alt="Cover" />
      <div class="card-category">{{ props.post.category.name }}</div>

      <button class="bookmark-btn" :class="{ active: bookmarkStore.isBookmarked(post.id) }" @click="handleBookmark"
        :disabled="bookmarkStore.isBookmarkLoading(post.id)">
        <div v-if="bookmarkStore.isBookmarkLoading(post.id)" class="btn-spinner"></div>
        <i v-else :class="bookmarkStore.isBookmarked(post.id) ? 'ph-fill ph-heart' : 'ph ph-heart'"></i>
      </button>
    </div>

    <div class="card-content">
      <div class="card-meta">
        <span class="meta-item">{{ props.post.date }}</span>
        <span class="dot">·</span>
        <span class="meta-item"><i class="ph ph-eye"></i> {{ props.post.views }}</span>
      </div>

      <h3 class="card-title">{{ props.post.title }}</h3>
      <p class="card-desc">{{ props.post.desc.substring(0, 80) }}...</p>

      <div class="card-footer">
        <span class="read-more" :style="{ color: themeStore.themeColor }">
          阅读文章 <i class="ph ph-arrow-right"></i>
        </span>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.post-card {
  background: var(--card-bg);
  height: 100%;
  @include flex-col;
  cursor: pointer;

  // 合并 transition
  transition:
    transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    background-color 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);

    .card-image {
      transform: scale(1.05);
    }
  }
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  position: relative;
  background-color: rgba(0, 0, 0, 0.03);

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .card-category {
    position: absolute;
    top: 15px;
    left: 15px;
    background: var(--card-bg);
    color: var(--text-main);
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    z-index: z('base');
  }

  .bookmark-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    @include flex(center, center);
    font-size: 1.2rem;
    color: #999;
    z-index: z('base');
    transition: all 0.3s;
    backdrop-filter: blur(4px);

    &:hover:not(:disabled) {
      transform: scale(1.1);
      color: #d00000;
    }

    &.active {
      color: #d00000;

      i {
        animation: heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }

    // Spinner 样式
    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ddd;
      border-top-color: #d00000;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

@keyframes heartPop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.card-content {
  padding: 24px;
  flex: 1;
  @include flex-col;
}

.card-meta {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 12px;
  @include flex(flex-start, center);
  gap: 8px;
}

.card-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-main);
  @include text-clamp(2);
}

.card-desc {
  font-size: 0.95rem;
  color: var(--text-sub);
  line-height: 1.6;
  margin-bottom: 24px;
  flex-grow: 1;
  @include text-clamp(3);
}

.read-more {
  font-size: 0.9rem;
  font-weight: 700;
  @include flex(flex-start, center);
  gap: 8px;
  transition: gap 0.3s;

  &:hover {
    gap: 12px;
  }
}
</style>
