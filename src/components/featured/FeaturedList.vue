<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useArticleModalStore } from '@/stores/articleModal'
import type { Post } from '@/types'
import { PhArrowUpRight } from "@phosphor-icons/vue";

// 接收父组件传入的文章列表
const props = defineProps<{
  posts: Post[]
}>()

// 向父组件发射事件
const emit = defineEmits<{
  (e: 'item-hover', post: Post): void
  (e: 'item-leave'): void
}>()

const router = useRouter()
const themeStore = useThemeStore()
const articleModalStore = useArticleModalStore()

const handleMouseEnter = (post: Post) => {
  emit('item-hover', post)
}

// 鼠标移出
const handleMouseLeave = () => {
  emit('item-leave')
}

const goToArticle = (id: number) => {
   articleModalStore.open(id)
}
</script>

<template>
  <section class="list-section">
    <div class="list-header">
      <h2>精选文章</h2>
      <p>Editor's Choice</p>
    </div>

    <div class="editorial-list">
      <div v-for="(post, index) in posts" :key="post.id" class="list-row" @mouseenter="handleMouseEnter(post)"
        @mouseleave="handleMouseLeave" @click="goToArticle(post.id)">
        <div class="row-index">0{{ index + 1 }}</div>
        <div class="row-info">
          <h3 class="row-title">{{ post.title }}</h3>
          <span class="row-cat">{{ post.category.name }}</span>
        </div>
        <div class="row-date">{{ post.date.substring(5) }}</div>
        <div class="row-arrow" :style="{ color: themeStore.themeColor }">
          <PhArrowUpRight/>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.list-section {
  padding: 0 5vw 120px;
}

.list-header {
  margin-bottom: 40px;
  @include flex(flex-start, baseline);
  gap: 15px;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-main);
  }

  p {
    font-family: $font-main;
    color: var(--text-sub);
    text-transform: uppercase;
  }
}

.editorial-list {
  border-top: 1px solid var(--border-light);
}

.list-row {
  display: grid;
  grid-template-columns: 0.5fr 3fr 1fr 0.5fr;
  align-items: center;
  padding: 30px 10px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  position: relative;
  background: transparent;
  transition: padding-left 0.3s ease, background-color 0.3s ease;

  &:hover {
    padding-left: 20px;

    .row-title {
      color: var(--primary-color);
    }

    .row-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .row-index {
      color: var(--primary-color);
    }
  }

  .row-index {
    font-family: $font-main;
    color: var(--border-light);
    font-size: 1.2rem;
    transition: color 0.3s;
  }

  .row-info {
    @include flex-col;
    gap: 5px;
  }

  .row-title {
    font-size: 1.5rem;
    font-weight: 500;
    transition: color 0.3s;
    color: var(--text-main);
  }

  .row-cat {
    font-size: 0.85rem;
    color: var(--text-sub);
  }

  .row-date {
    font-family: $font-main;
    color: var(--text-sub);
    text-align: right;
  }

  .row-arrow {
    text-align: right;
    font-size: 1.5rem;
    opacity: 0;
    transform: translateX(-10px);
    transition: opacity 0.3s, transform 0.3s;
  }

  @include mobile {
    grid-template-columns: 1fr auto;
    gap: 10px;

    .row-index,
    .row-date {
      display: none;
    }

    .row-arrow {
      display: block;
      opacity: 1;
      transform: none;
      font-size: 1rem;
    }

    .row-title {
      font-size: 1.1rem;
    }
  }
}
</style>
