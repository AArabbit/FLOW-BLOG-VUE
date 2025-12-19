<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()

defineProps<{
  size?: 'small' | 'medium' | 'large'
}>()
</script>

<template>
  <div class="spinner-wrapper" :class="size || 'medium'">
    <div class="spinner" :style="{ borderTopColor: themeStore.themeColor, borderLeftColor: themeStore.themeColor }">
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.spinner-wrapper {
  @include flex(center, center);
  padding: 20px;
  width: 100%;

  &.small .spinner {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }

  &.medium .spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }

  &.large .spinner {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.1); // 底色
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
