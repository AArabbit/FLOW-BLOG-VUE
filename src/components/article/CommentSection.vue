<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { getComments, addComment, deleteComment, type Comment } from '@/api/comment'
import { useUIStore } from '@/stores/ui'
import CommentInput from './comment/CommentInput.vue'
import CommentList from './comment/CommentList.vue'

const props = defineProps<{ postId: number }>()
const authStore = useAuthStore()
const uiStore = useUIStore()
const message = useMessage() // 初始化消息实例

// 评论项的前端格式
interface CommentItem {
  id: number
  user: string
  avatar: string
  content: string
  date: Date
}

// 状态管理
const isFetching = ref(true)
const isSubmitting = ref(false)
const comments = ref<CommentItem[]>([])

// 获取评论列表
const fetchComments = async () => {
  isFetching.value = true
  try {
    const res = await getComments({ posts_id: props.postId })
    // 转换后端数据为前端格式
    comments.value = res.comments.map((c: Comment) => ({
      id: c.id,
      user: c.user_name,
      avatar: c.avatar,
      content: c.content,
      date: new Date(c.created_at)
    }))
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    comments.value = []
  } finally {
    isFetching.value = false
  }
}

// 提交评论逻辑
const handleNewComment = async (content: string) => {
  // 检查登录状态
  if (!authStore.user) {
    uiStore.toggleLoginModal(true)
    message.warning('请先登录后再发表评论')
    return
  }

  isSubmitting.value = true
  try {
    await addComment({
      post_id: props.postId,
      user_id: authStore.user.id,
      user_name: authStore.user.name,
      avatar: authStore.user.avatar,
      content: content
    })

    const comment: CommentItem = {
      id: Date.now(),
      user: authStore.user.name,
      avatar: authStore.user.avatar,
      content: content,
      date: new Date()
    }
    comments.value.unshift(comment)

    message.success('评论发布成功！')
  } catch (error) {
    console.error('Failed to add comment:', error)
    message.error('评论发布失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 删除评论逻辑
const handleDeleteComment = async (commentId: number) => {
  try {
    await deleteComment({ comment_id: commentId })
    message.success('评论已删除')
    // 重新获取评论列表
    await fetchComments()
  } catch (error) {
    console.error('Failed to delete comment:', error)
    message.error('删除评论失败，请重试')
  }
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

    <CommentList :comments="comments" :loading="isFetching" :current-user="authStore.user"
      @delete="handleDeleteComment" />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.comment-section {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 60px;
  // border-top: 1px solid var(--border-light);
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
