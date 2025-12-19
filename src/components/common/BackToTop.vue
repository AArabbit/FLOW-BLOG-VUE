<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, Ref } from 'vue'
import gsap from 'gsap'
import { useThemeStore } from '@/stores/theme'
import { PhArrowUp } from "@phosphor-icons/vue";
import Lenis from 'lenis';

const themeStore = useThemeStore()
const isVisible = ref(false)
const btnRef = ref<HTMLElement | null>(null)

const globalLenis = inject<Ref<Lenis | null> >('globalLenis')

const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const shouldShow = scrollTop > 300 // 滚动超过300px显示

  if (shouldShow !== isVisible.value) {
    isVisible.value = shouldShow
    if (shouldShow) {
      gsap.to(btnRef.value, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', pointerEvents: 'auto' })
    } else {
      gsap.to(btnRef.value, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' })
    }
  }
}

const scrollToTop = () => {
  if (globalLenis?.value) {
     globalLenis.value.scrollTo("top")
  }
}

onMounted(() => {
  // 初始化隐藏
  gsap.set(btnRef.value, { y: 20, opacity: 0, pointerEvents: 'none' })
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <button ref="btnRef" class="back-to-top" :style="{ backgroundColor: themeStore.themeColor }" @click="scrollToTop">
    <PhArrowUp />

    <div class="glow"></div>
  </button>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 1.5rem;
  z-index: z('tooltip'); // 在最上层
  @include flex(center, center);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); // 弹性效果

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }

  i {
    position: relative;
    z-index: 2;
  }
}

// 移动端适配位置
@include mobile {
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
