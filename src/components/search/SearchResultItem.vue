<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import type { Post } from '@/types'
import { PhArrowRight } from "@phosphor-icons/vue";

defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (e: 'click', id: number): void
}>()

const themeStore = useThemeStore()
</script>

<template>
  <div class="search-result-item" @click="emit('click', post.id)">
    <div class="item-content">
      <span class="item-cat" :style="{ color: themeStore.themeColor }">
        {{ post.category.name }}
      </span>
      <h3 class="item-title">{{ post.title }}</h3>
    </div>
    <PhArrowRight class="item-icon"/>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: padding-left 0.3s;
  animation: fadeIn 0.5s ease forwards;

  &:hover {
    padding-left: 20px;

    .item-icon {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .item-content {
    .item-cat {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 5px;
    }

    .item-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-main);
      transition: color 0.3s;
    }
  }

  .item-icon {
    font-size: 1.5rem;
    opacity: 0;
    transform: translateX(-20px);
    transition: all 0.3s;
    color: var(--primary-color);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
