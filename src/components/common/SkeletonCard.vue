<template>
  <div class="skeleton-card">
    <div class="skeleton-image skeleton-anim"></div>
    <div class="skeleton-content">
      <div class="skeleton-meta skeleton-anim"></div>
      <div class="skeleton-title skeleton-anim"></div>
      <div class="skeleton-title w-60 skeleton-anim"></div>
      <div class="skeleton-desc skeleton-anim"></div>
      <div class="skeleton-desc skeleton-anim"></div>
      <div class="skeleton-footer skeleton-anim"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;

.skeleton-card {
  background: var(--card-bg);
  height: 100%;
  @include flex-col;
  border: 1px solid transparent; // 占位防止抖动
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 16/9;
  background: rgba(0, 0, 0, 0.05);
}

.skeleton-content {
  padding: 24px;
  flex: 1;
  @include flex-col;
  align-items: flex-start;
  gap: 15px;
}

.skeleton-meta {
  width: 40%;
  height: 14px;
  border-radius: 4px;
}

.skeleton-title {
  width: 90%;
  height: 24px;
  border-radius: 4px;

  &.w-60 {
    width: 60%;
    margin-top: -5px;
  }
}

.skeleton-desc {
  width: 100%;
  height: 14px;
  border-radius: 4px;

  &:last-child {
    width: 80%;
  }
}

.skeleton-footer {
  width: 30%;
  height: 16px;
  margin-top: auto;
  border-radius: 4px;
}

// 流光动画
.skeleton-anim {
  background: linear-gradient(90deg,
      var(--border-light) 25%,
      rgba(150, 150, 150, 0.1) 37%,
      var(--border-light) 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
