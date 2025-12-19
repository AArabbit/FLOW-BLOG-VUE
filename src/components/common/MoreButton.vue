<script setup lang="ts">
import { PhArrowRight } from "@phosphor-icons/vue";

const { label } = defineProps<{ label?: string }>()
const emit = defineEmits<{ (e: 'click', event: Event): void }>()

const handleClick = (e: Event) => {
  emit('click', e)
}
</script>

<template>
  <button class="awards-btn" @click="handleClick">
    <span class="btn-text">{{ label || '查看更多' }}</span>
    <span class="btn-icon-box">
      <PhArrowRight class="icon-main"/>
      <PhArrowRight class="icon-hover"/>
    </span>
  </button>
</template>

<style scoped lang="scss">
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

/* 按钮 */
.more-actions {
  display: flex;
  justify-content: center;
}

.awards-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 32px;
  border-radius: 100px;
  background-color: transparent;
  border: 1px solid var(--border-light);
  font-family: var(--font-main, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-main);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.btn-text {
  position: relative;
  z-index: 2;
  transition: color 0.4s ease;
}

.btn-icon-box {
  position: relative;
  width: 16px;
  height: 16px;
  overflow: hidden;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center
}

.btn-icon-box i {
  position: absolute;
  font-size: 1.1rem;
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.icon-main {
  transform: translateX(0);
}

.icon-hover {
  transform: translateX(-150%);
  color: var(--bg-color);
}

.awards-btn:hover {
  border-color: var(--text-main);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px var(--border-light);
}

.awards-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--text-main);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 1
}

.awards-btn:hover::after {
  transform: scaleY(1);
  transform-origin: top
}

.awards-btn:hover .btn-text,
.awards-btn:hover .icon-main {
  color: var(--bg-color)
}

.awards-btn:hover .icon-main {
  transform: translateX(150%)
}

.awards-btn:hover .icon-hover {
  transform: translateX(0);
  color: var(--bg-color)
}

@media (max-width: 768px) {
  .awards-btn {
    padding: 12px 22px;
    font-size: 0.82rem
  }
}
</style>
