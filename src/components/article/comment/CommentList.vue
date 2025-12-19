<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { NAvatar, NTime } from 'naive-ui'
import gsap from 'gsap'
import type { User } from '@/types'

const props = defineProps<{
  comments: any[]
  loading: boolean
  currentUser: User | null  // 当前登录用户
}>()

const emit = defineEmits<{
  (e: 'delete', commentId: number): void
}>()

// 权限验证
const canDelete = (comment: any): boolean => {
  if (!props.currentUser) return false
  // admin 可以删除任何评论
  if (props.currentUser.role === 'admin') return true
  // 普通用户只能删除自己的评论
  return props.currentUser.name === comment.user
}

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

const handleDelete = (commentId: number) => {
  emit('delete', commentId)
}
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
          <div class="comment-header">
            <div class="comment-meta">
              <span class="name">{{ comment.user }}</span>
              <span class="dot">·</span>
              <span class="time"><n-time :time="comment.date" type="relative" /></span>
            </div>
            <button v-if="canDelete(comment)" class="delete-btn" @click="handleDelete(comment.id)" title="删除评论">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
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

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: 8px;
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

  // 删除按钮
  .delete-btn {
    opacity: 0;
    visibility: hidden;
    padding: 6px;
    border: none;
    background: transparent;
    color: var(--text-sub);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s $ease-smooth;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #e74c3c;
      background: rgba(231, 76, 60, 0.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  // hover 评论项时显示删除按钮
  &:hover .delete-btn {
    opacity: 1;
    visibility: visible;
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
