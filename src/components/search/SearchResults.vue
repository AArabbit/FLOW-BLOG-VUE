<script setup lang="ts">
import type { Post } from '@/types'
import SearchResultItem from './SearchResultItem.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 接收所有状态
defineProps<{
  results: Post[]
  query: string
  isLoading: boolean
  isSearching: boolean
  isInitialLoad: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate', id: number): void
}>()

// 暴露 sentinel 给父组件用于 IntersectionObserver
import { ref } from 'vue'
const sentinelRef = ref<HTMLElement | null>(null)
defineExpose({ sentinelRef })
</script>

<template>
  <div class="results-wrapper">
    <div v-if="isSearching" class="loading-state">
      <LoadingSpinner size="medium" />
    </div>

    <div v-else-if="results.length > 0" class="results-list">
      <p class="result-meta">Search Results</p>

      <SearchResultItem v-for="post in results" :key="post.id" :post="post" @click="emit('navigate', post.id)" />

      <div ref="sentinelRef" class="sentinel">
        <LoadingSpinner v-if="isLoading" size="small" />
      </div>
    </div>

    <div v-else-if="query && !isSearching" class="no-results">
      <p>未找到关于 "{{ query }}" 的内容</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.results-wrapper {
  .result-meta {
    font-size: 0.9rem;
    color: var(--text-sub);
    margin-bottom: 20px;
    font-family: 'Space Grotesk';
  }
}

.no-results {
  text-align: center;
  color: var(--text-sub);
  font-size: 1.2rem;
  border-bottom: none;
  padding: 40px 0;
}

.loading-state {
  padding: 40px 0;
  @include flex(center, center);
}

.sentinel {
  height: 60px;
  @include flex(center, center);
  width: 100%;
}
</style>
