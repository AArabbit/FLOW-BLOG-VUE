<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NAvatar, NInput } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', content: string): void
}>()

const authStore = useAuthStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const newComment = ref('')

const handleSubmit = () => {
  if (!newComment.value.trim()) return
  emit('submit', newComment.value)
  newComment.value = '' // 清空输入框
}
</script>

<template>
  <div class="input-area">
    <div v-if="authStore.user" class="logged-in-input">
      <div class="user-info">
        <n-avatar round :src="authStore.user.avatar" size="medium" />
        <span>{{ authStore.user.name }}</span>
      </div>
      <div class="input-box">
        <n-input v-model:value="newComment" type="textarea" placeholder="写下你的想法..." :autosize="{ minRows: 3 }"
          class="custom-textarea" :disabled="props.isSubmitting" />
        <div class="action-row">
          <n-button type="primary" :color="themeStore.themeColor" @click="handleSubmit"
            :disabled="!newComment.trim() || props.isSubmitting" :loading="props.isSubmitting">
            发表评论
          </n-button>
        </div>
      </div>
    </div>

    <div v-else class="guest-input" @click="uiStore.toggleLoginModal(true)">
      <div class="placeholder-box">
        <i class="ph ph-chat-circle-text"></i>
        <span>登录以参与讨论...</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.input-area {
  margin-bottom: 60px;
}

.logged-in-input {
  animation: fadeIn 0.5s ease;

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    font-weight: bold;
    color: var(--text-main);
  }

  .action-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}

.guest-input {
  cursor: pointer;

  .placeholder-box {
    background: var(--card-bg);
    border: 1px solid var(--border-light);
    padding: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-sub);
    transition: all 0.3s;

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    i {
      font-size: 1.2rem;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
