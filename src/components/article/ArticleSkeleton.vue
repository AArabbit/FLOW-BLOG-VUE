<script setup lang="ts">
</script>

<template>
  <div class="content-skeleton">
    <!-- 文本块  -->
    <div class="s-block">
      <div class="s-line w-100"></div>
      <div class="s-line w-90"></div>
      <div class="s-line w-95"></div>
      <div class="s-line w-60"></div>
    </div>

    <!-- 段落 -->
    <div class="s-block">
      <div class="s-line w-80 h-title"></div>
      <div class="s-line w-100"></div>
      <div class="s-line w-100"></div>
      <div class="s-line w-40"></div>
    </div>

    <!-- 模拟图片 -->
    <div class="s-block">
      <div class="s-img"></div>
      <div class="s-line w-100"></div>
      <div class="s-line w-80"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.content-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  background: var(--bg-color);
}

.s-block {
  margin-bottom: 40px;
}

.s-line {
  height: 16px;
  margin-bottom: 14px;
  border-radius: 4px;
  background: var(--border-light);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg,
        transparent,
        var(--bg-color),
        transparent);
    opacity: 0.5;
    animation: shimmer 1.5s infinite;
  }

  // 宽度修饰类
  &.w-100 {
    width: 100%;
  }

  &.w-95 {
    width: 95%;
  }

  &.w-90 {
    width: 90%;
  }

  &.w-80 {
    width: 80%;
  }

  &.w-60 {
    width: 60%;
  }

  &.w-40 {
    width: 40%;
  }

  // 标题修饰
  &.h-title {
    height: 32px;
    margin-bottom: 24px;
    background-color: var(--text-sub);
    opacity: 0.15;
  }
}

.s-img {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  margin-bottom: 24px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-light);

  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg,
        transparent,
        var(--bg-color),
        transparent);
    opacity: 0.3;
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>