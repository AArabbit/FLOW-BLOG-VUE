<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui' // 引入组件内消息 Hook
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
// 引入拆分后的子组件
import CommentInput from './comment/CommentInput.vue'
import CommentList from './comment/CommentList.vue'

const props = defineProps<{ postId: number }>()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const message = useMessage() // 初始化消息实例

// 状态管理
const isFetching = ref(true)
const isSubmitting = ref(false)
const comments = ref<any[]>([])

// 获取评论列表 (模拟)
const fetchComments = async () => {
  isFetching.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))

  comments.value = [
    { id: 1, user: 'Sarah Jen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', content: '非常深刻的见解，特别是关于 GSAP 动画性能优化的部分，对我启发很大！', date: new Date(Date.now() - 86400000) },
    { id: 2, user: 'Mike Ross', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', content: '期待下一篇关于 WebGL 的文章。', date: new Date(Date.now() - 172800000) }
  ]
  isFetching.value = false
}

// 提交评论逻辑
const handleNewComment = async (content: string) => {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  const comment = {
    id: Date.now(),
    user: authStore.user?.name || 'User',
    avatar: authStore.user?.avatar || '',
    content: content,
    date: new Date()
  }

  comments.value.unshift(comment)
  isSubmitting.value = false

  // 成功提示
  message.success('评论发布成功！')
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="comment-section">
    <div class="header">
      <h3>评论区 ({{ comments.length }})</h3>
      <div class="line"></div>
    </div>

    <CommentInput :is-submitting="isSubmitting" @submit="handleNewComment" />

    <CommentList :comments="comments" :loading="isFetching" />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.comment-section {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 60px;
  border-top: 1px solid var(--border-light);
}

.header {
  @include flex(flex-start, center);
  gap: 20px;
  margin-bottom: 40px;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .line {
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }
}
</style>
