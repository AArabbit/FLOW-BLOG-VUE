<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NInput, NSpace } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits(['switch-view'])
const authStore = useAuthStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const form = ref({ username: '', password: '' })
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    uiStore.setAuthError('请输入用户名和密码')
    return
  }
  isLoading.value = true
  // 模拟稍微的延迟感
  await new Promise(resolve => setTimeout(resolve, 500))
  authStore.login(form.value)
  isLoading.value = false
}
</script>

<template>
  <div class="form-wrapper">
    <n-space vertical size="large">
      <div class="input-group">
        <label>用户名</label>
        <n-input v-model:value="form.username" placeholder="请输入用户名" size="large" />
      </div>

      <div class="input-group">
        <label>
          密码
          <span class="forgot-link" @click="emit('switch-view', 'forgot')">忘记密码?</span>
        </label>
        <n-input v-model:value="form.password" type="password" show-password-on="mousedown" placeholder="请输入密码"
          size="large" @keydown.enter="handleSubmit" />
      </div>

      <div v-if="uiStore.authMessage" class="status-msg" :class="{ 'error': uiStore.isLoginError }">
        {{ uiStore.authMessage }}
      </div>

      <n-button block type="primary" size="large" :loading="isLoading" :color="themeStore.themeColor"
        style="height: 50px; font-weight: bold; font-size: 1rem;" @click="handleSubmit">
        立即登录
      </n-button>

      <div class="switch-mode">
        还没有账号? <span class="link" :style="{ color: themeStore.themeColor }"
          @click="emit('switch-view', 'register')">注册新账号</span>
      </div>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
@use "./auth-shared.scss";
</style>



