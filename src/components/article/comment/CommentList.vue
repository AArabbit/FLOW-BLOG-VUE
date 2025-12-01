<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { NAvatar, NTime } from 'naive-ui'
import gsap from 'gsap'

const props = defineProps<{
  comments: any[]
  loading: boolean
}>()

// 监听评论数量变化，如果有新增，执行入场动画
watch(() => props.comments.length, (newVal, oldVal) => {
  if (newVal > oldVal && !props.loading) {
    nextTick(() => {
      // 动画作用于列表的第一个元素 (最新评论)
      gsap.fromTo('.comment-item:first-child',
        { y: -20, opacity: 0, height: 0, marginBottom: 0 },
        { y: 0, opacity: 1, height: 'auto', marginBottom: 30, duration: 0.6, ease: "power2.out" }
      )
    })
  }
})
</script>

<template>
  <div class="comment-list-wrapper">

    <div v-if="loading" class="skeleton-list">
      <div v-for="n in 3" :key="n" class="skeleton-item">
        <div class="s-avatar skeleton-anim"></div>
        <div class="s-content">
          <div class="s-line w-30 skeleton-anim"></div>
          <div class="s-line w-full skeleton-anim"></div>
          <div class="s-line w-80 skeleton-anim"></div>
        </div>
      </div>
    </div>

    <div v-else class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <n-avatar round :src="comment.avatar" />
        </div>
        <div class="comment-content">
          <div class="comment-meta">
            <span class="name">{{ comment.user }}</span>
            <span class="dot">·</span>
            <span class="time"><n-time :time="comment.date" type="relative" /></span>
          </div>
          <p class="text">{{ comment.content }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.comment-item {
  display: flex;
  gap: 20px;

  .comment-content {
    flex: 1;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 30px;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-family: $font-main;
    font-size: 0.9rem;

    .name {
      font-weight: 700;
      color: var(--text-main);
    }

    .dot {
      color: var(--border-light);
    }

    .time {
      color: var(--text-sub);
    }
  }

  .text {
    line-height: 1.6;
    color: var(--text-main);
    font-size: 1rem;
  }
}

// --- Skeleton Styles ---
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.skeleton-item {
  display: flex;
  gap: 20px;
}

.s-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
}

.s-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.s-line {
  height: 14px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;

  &.w-30 {
    width: 30%;
  }

  &.w-full {
    width: 100%;
  }

  &.w-80 {
    width: 80%;
  }
}

.skeleton-anim {
  background: linear-gradient(90deg, var(--card-bg) 25%, rgba(150, 150, 150, 0.05) 37%, var(--card-bg) 63%);
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
