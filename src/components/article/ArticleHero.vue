<script setup lang="ts">
// import { defineProps } from 'vue'
import { NTag, NButton } from 'naive-ui'
import { useBookmarkStore } from '@/stores/bookmarks'
import type { Post } from '@/types'

const props = defineProps<{
  post: Post
}>()

const bookmarkStore = useBookmarkStore()
</script>

<template>
  <div class="article-hero">
    <div class="hero-content">
      <div class="article-meta">
        <n-tag round :bordered="false" type="primary" size="small" class="cat-tag">
          {{ post.category.name }}
        </n-tag>
        <span class="date">{{ post.date }}</span>
        <span class="views"><i class="ph ph-eye"></i> {{ post.views }}</span>
      </div>

      <h1 class="article-title">{{ post.title }}</h1>

      <div class="article-actions">
        <n-button class="hero-action-btn" round secondary size="medium" @click="bookmarkStore.toggleBookmark(post.id)"
          :type="bookmarkStore.isBookmarked(post.id) ? 'error' : 'default'"
          :loading="bookmarkStore.isBookmarkLoading(post.id)">
          <template #icon>
            <i :class="bookmarkStore.isBookmarked(post.id) ? 'ph-fill ph-heart' : 'ph ph-heart'"></i>
          </template>
          {{ bookmarkStore.isBookmarked(post.id) ? '已收藏' : '收藏文章' }}
        </n-button>
      </div>
    </div>

    <div class="cover-wrapper">
      <img :src="post.cover" class="article-cover" alt="cover" />
      <div class="overlay"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.article-hero {
  height: 60vh;
  position: relative;
  @include flex(flex-start, flex-end);
  padding: 0 5vw 60px;
  color: #fff;
  background: var(--card-bg);
  margin-top: 80px;
  overflow: hidden;
}

.cover-wrapper {
  @include abs-cover;
  z-index: 0;

  .article-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    @include abs-cover;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1));
  }
}

.hero-content {
  position: relative;
  z-index: z('base');
  max-width: 900px;
}

.article-meta {
  @include flex(flex-start, center);
  gap: 15px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);

  .date,
  .views {
    font-family: $font-main;
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.article-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
}

.article-actions {
  margin-top: 20px;
}

// 强制覆盖按钮颜色
.hero-action-btn {
  background-color: transparent; // 确保背景透明

  // 默认状态 (未收藏) - 强制白色
  &.n-button--default-type {
    --n-text-color: #ffffff !important;
    --n-border: 1px solid rgba(255, 255, 255, 0.6) !important;
    --n-text-color-hover: #ffffff !important;
    --n-text-color-pressed: #ffffff !important;
    --n-text-color-focus: #ffffff !important;
    --n-border-hover: 1px solid #ffffff !important;
    --n-border-pressed: 1px solid #ffffff !important;
    --n-border-focus: 1px solid #ffffff !important;
    --n-icon-color: #ffffff !important;
  }

  // 已收藏状态 (Error类型) - 提升亮度
  &.n-button--error-type {
    // 使用亮红色，防止在深色背景上看不清
    --n-text-color: #ff8080 !important;
    --n-border: 1px solid #ff8080 !important;
    --n-text-color-hover: #ff9999 !important;
    --n-border-hover: 1px solid #ff9999 !important;
    --n-icon-color: #ff8080 !important;
  }
}
</style>
