<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useArticleModalStore } from '@/stores/articleModal'
import type { Post } from '@/types'
import { PhArrowRight } from "@phosphor-icons/vue";

const props = defineProps<{
  post: Post
}>()

const router = useRouter()
const themeStore = useThemeStore()
const articleModalStore = useArticleModalStore()

const handleOpenPost = (post: Post) => {
  articleModalStore.open(post.id)
}
</script>

<template>
  <section class="spotlight-section" @click="handleOpenPost(post)">
    <div class="spotlight-wrapper">
      <div class="spotlight-image-box">
        <img :src="post.cover" class="spotlight-img" alt="Hero" />
        <div class="overlay">
          <span class="badge">今日推荐</span>
        </div>
      </div>
      <div class="spotlight-content">
        <div class="meta">
          <span class="date">{{ post.date }}</span>
          <span class="line"></span>
          <span class="cat">{{ post.category.name }}</span>
        </div>
        <h1 class="spotlight-title">{{ post.title }}</h1>
        <p class="spotlight-desc">{{ post.desc }}</p>
        <div class="read-btn" :style="{ color: themeStore.themeColor }">
          阅读全文 <PhArrowRight />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.spotlight-section {
  padding: 120px 5vw 80px;
  cursor: pointer;

  &:hover .spotlight-title {
    color: var(--primary-color);
  }
}

.spotlight-wrapper {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.spotlight-image-box {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  position: relative;

  .spotlight-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .badge {
    position: absolute;
    top: 20px;
    left: 20px;
    background: var(--card-bg);
    color: var(--text-main);
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  &:hover .spotlight-img {
    transform: scale(1.05);
  }
}

.spotlight-content {
  .meta {
    @include flex(flex-start, center);
    gap: 15px;
    margin-bottom: 20px;
    font-family: $font-main;
    color: var(--text-sub);
    font-size: 0.9rem;

    .line {
      width: 30px;
      height: 1px;
      background: var(--border-light);
    }
  }

  .spotlight-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1.1;
    margin-bottom: 24px;
    transition: color 0.3s;
    color: var(--text-main);
  }

  .spotlight-desc {
    font-size: 1.1rem;
    color: var(--text-sub);
    line-height: 1.7;
    margin-bottom: 40px;
    max-width: 90%;
    @include text-clamp(3);
  }

  .read-btn {
    font-weight: 700;
    @include flex(flex-start, center);
    gap: 10px;
    font-size: 1rem;
  }
}
</style>
