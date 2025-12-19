<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { PhX } from "@phosphor-icons/vue";

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// 暴露 focus 方法给父组件调用
const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

defineExpose({ focusInput })
</script>

<template>
  <div class="search-header">
    <button class="close-btn" @click="emit('close')">
      <PhX />
    </button>

    <div class="input-wrapper">
      <input ref="inputRef" :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" type="text" placeholder="搜索..."
        class="search-input" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.search-header {
  position: relative;
  width: 100%;
}

.close-btn {
  position: absolute;
  top: -80px;
  right: 0; // 相对于容器右对齐
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  transition: transform 0.3s, color 0.3s;
  color: var(--text-sub);

  &:hover {
    transform: rotate(90deg);
    color: var(--text-main);
  }
}

.input-wrapper {
  margin-bottom: 60px;
  border-bottom: 2px solid var(--border-light);

  .search-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: clamp(3rem, 6vw, 5rem);
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    color: var(--text-main);
    padding: 20px 0;
    outline: none;
    transition: color 0.3s;

    &::placeholder {
      color: var(--text-sub);
      opacity: 0.3;
    }
  }
}
</style>
