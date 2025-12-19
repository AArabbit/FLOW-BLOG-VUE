<script setup lang="ts">
// import { defineProps } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useAuthStore } from '@/stores/auth'
import type { Post } from '@/types'
import { NButton } from 'naive-ui';
import { PhEye, PhHeart } from "@phosphor-icons/vue";

const props = defineProps<{
  post: Post
}>()

const bookmarkStore = useBookmarkStore()
const authStore = useAuthStore()
</script>

<template>
  <div class="article-hero">
    <div class="hero-content">
      <div class="article-meta">
        <span class="cat-tag">{{ post.category.name }}</span>
        <span class="date">{{ post.date }}</span>
        <span class="views">
          <PhEye /> {{ post.views }}
        </span>
        <div v-if="post.author" class="author-info">
          <img :src="post.author.avatar" class="author-avatar" alt="avatar" />
          <span class="author-name">{{ post.author.username }}</span>
        </div>
      </div>

      <h1 class="article-title">{{ post.title }}</h1>

      <div class="article-actions">
        <n-button v-if="authStore.user" class="hero-action-btn" round secondary size="medium"
          @click="bookmarkStore.toggleBookmark(post.id)"
          :type="bookmarkStore.isBookmarked(post.id) ? 'error' : 'default'"
          :loading="bookmarkStore.isBookmarkLoading(post.id)">
          <template #icon>
            <PhHeart :weight="bookmarkStore.isBookmarked(post.id) ? 'fill' : 'regular'" />
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
  // margin-top: 80px;
  margin-top: 0;
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

  .cat-tag {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: text;
  }

  .date,
  .views {
    font-family: $font-main;
    font-size: 0.9rem;
    opacity: 0.8;
    cursor: text;
  }

  .author-info {
    @include flex(flex-start, center);
    gap: 8px;
    // margin-left: auto;
    opacity: 0.9;

    .author-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .author-name {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.9);
      cursor: text;
    }
  }
}

.article-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
  cursor: text;
}

.article-actions {
  margin-top: 20px;
}

// 强制覆盖按钮颜色
.hero-action-btn {
  background-color: transparent;

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

  &.n-button--error-type {
    --n-text-color: #ff8080 !important;
    --n-border: 1px solid #ff8080 !important;
    --n-text-color-hover: #ff9999 !important;
    --n-border-hover: 1px solid #ff9999 !important;
    --n-icon-color: #ff8080 !important;
  }
}
</style>
