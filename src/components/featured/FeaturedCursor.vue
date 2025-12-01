<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 增加 isLoading 属性
defineProps<{
  text: string
  category: string
  isLoading: boolean
}>()

const themeStore = useThemeStore()
const rootRef = ref<HTMLElement | null>(null)

defineExpose({ rootRef })
</script>

<template>
  <div ref="rootRef" class="cursor-preview-wrapper">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner size="small" />
      <span class="loading-text">加载中...</span>
    </div>

    <div v-else class="content-state">
      <div class="preview-header">
        <span class="preview-dot" :style="{ background: themeStore.themeColor }"></span>
        <span class="preview-cat">{{ category }}</span>
      </div>
      <p class="preview-text">
        {{ text }}
      </p>
      <div class="preview-footer">
        预览
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.cursor-preview-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  background: var(--card-bg);
  padding: 24px;
  pointer-events: none;
  z-index: z('tooltip');
  opacity: 0;
  transform: scale(0.8);
  border-radius: 4px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-light);

  // 保持最小高度，防止加载/内容切换时高度跳动
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @include mobile {
    display: none;
  }
}

.loading-state {
  @include flex(center, center, column);
  gap: 10px;
  height: 100%;
  animation: fadeIn 0.3s ease;

  .loading-text {
    font-size: 0.75rem;
    font-family: $font-main;
    color: var(--text-sub);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.content-state {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  @include flex(flex-start, center);
  gap: 8px;
  margin-bottom: 12px;

  .preview-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .preview-cat {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-sub);
  }
}

.preview-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-main);
  margin-bottom: 16px;
  @include text-clamp(4);
}

.preview-footer {
  font-family: $font-main;
  font-size: 0.8rem;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  margin-top: auto; // 推到底部
}
</style>
