<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NInput, NSpace, NInputGroup } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits(['switch-view', 'success'])
const authStore = useAuthStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const form = ref({ username: '', password: '', email: '', code: '' })
const isLoading = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
})

const handleSendCode = async () => {
  if (!isEmailValid.value) return

  isSendingCode.value = true
  try {
    const success = await authStore.sendVerificationCode(form.value.email)
    if (success) {
      uiStore.setAuthSuccess('验证码已发送')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    }
  } finally {
    isSendingCode.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.username || !form.value.code) {
    uiStore.setAuthError('请填写完整信息')
    return
  }

  if (!/^[a-zA-Z0-9]+$/.test(form.value.username)) {
    uiStore.setAuthError('用户名只能包含字母和数字')
    return
  }

  isLoading.value = true
  const success = await authStore.register(form.value)
  isLoading.value = false
  if (success) emit('success')
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
        <label>电子邮箱</label>
        <n-input v-model:value="form.email" placeholder="example@mail.com" size="large" />
      </div>

      <div class="input-group">
        <label>验证码</label>
        <n-input-group>
          <n-input v-model:value="form.code" placeholder="6位验证码" size="large" />
          <n-button size="large" secondary :disabled="countdown > 0 || !isEmailValid" :loading="isSendingCode"
            @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </n-button>
        </n-input-group>
      </div>

      <div class="input-group">
        <label>密码</label>
        <n-input v-model:value="form.password" type="password" show-password-on="mousedown" size="large" />
      </div>

      <div v-if="uiStore.authMessage" class="status-msg"
        :class="{ 'error': uiStore.isLoginError, 'success': !uiStore.isLoginError }">
        {{ uiStore.authMessage }}
      </div>

      <n-button block type="primary" size="large" :loading="isLoading" :color="themeStore.themeColor"
        style="height: 50px; font-weight: bold;" @click="handleSubmit">
        注册账号
      </n-button>

      <div class="switch-mode">
        已有账号? <span class="link" :style="{ color: themeStore.themeColor }"
          @click="emit('switch-view', 'login')">立即登录</span>
      </div>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
@use "./auth-shared.scss";
</style>
