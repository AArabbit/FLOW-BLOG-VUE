<template>
  <div
    ref="el"
    class="custom-cursor"
    :class="{ 'is-hidden': !isHovering, 'is-clicking': isDragging }"
  >
    <div class="cursor-dot left"></div>
    <div class="cursor-main">
      <span>Drag</span>
    </div>
    <div class="cursor-dot right"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps({
  isHovering: { type: Boolean, default: false },
  isDragging: { type: Boolean, default: false }
});

const el = ref<HTMLElement | null>(null);
defineExpose({ el });
</script>

<style scoped>
/* 自定义 Drag 光标 (适配暗黑) */
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  opacity: 1;
  transition: opacity 0.2s ease;
  margin-left: -50px;
  margin-top: -30px;
  width: 100px;
  height: 60px;
}
.custom-cursor.is-hidden { opacity: 0; }

.cursor-dot {
  width: 5px;
  height: 5px;
  background-color: var(--text-main);
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.9;
}

.cursor-main {
  width: 56px;
  height: 56px;
  background-color: var(--text-main);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-color);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28), background-color 0.4s ease, color 0.4s ease;
}

.custom-cursor.is-clicking .cursor-main { transform: scale(0.85); }
</style>
