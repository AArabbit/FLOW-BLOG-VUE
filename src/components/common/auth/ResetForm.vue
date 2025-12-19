<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NInput, NSpace, NInputGroup } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { updatePassword } from '@/api/auth'

const props = defineProps<{
  isChangePassword?: boolean
}>()

const emit = defineEmits(['switch-view', 'success'])
const authStore = useAuthStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const form = ref({ email: '', code: '', password: '', confirmPassword: '' })
const isLoading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
})

const isPasswordMatch = computed(() => {
  return form.value.password === form.value.confirmPassword && form.value.password.length > 0
})

const handleSendCode = async () => {
  if (!isEmailValid.value) {
    uiStore.setAuthError('请输入有效的邮箱')
    return
  }
  codeSending.value = true
  const success = await authStore.sendVerificationCode(form.value.email)
  if (success) {
    uiStore.setAuthSuccess('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }
  codeSending.value = false
}

const handleSubmit = async () => {
  if (!form.value.password) {
    uiStore.setAuthError('请输入新密码')
    return
  }

  if (!isPasswordMatch.value) {
    uiStore.setAuthError('两次输入的密码不一致')
    return
  }

  isLoading.value = true
  try {
    if (props.isChangePassword) {
      // 修改密码模式
      await updatePassword({
        code: form.value.code,
        email: form.value.email,
        password: form.value.password
      })
      uiStore.setAuthSuccess('密码修改成功，请重新登录')
      await authStore.logout()
      emit('success')
    } else {
      // 重置密码模式
      const success = await authStore.resetPassword(form.value)
      if (success) emit('success')
    }
  } catch (error: any) {
    uiStore.setAuthError(error?.message || '操作失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-wrapper">
    <n-space vertical size="large">
      <div class="input-group">
        <label>电子邮箱</label>
        <n-input v-model:value="form.email" placeholder="example@mail.com" size="large" />
      </div>

      <div class="input-group">
        <label>验证码</label>
        <n-input-group>
          <n-input v-model:value="form.code" placeholder="6位验证码" size="large" />
          <n-button size="large" secondary :disabled="countdown > 0 || !isEmailValid" :loading="codeSending" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </n-button>
        </n-input-group>
      </div>

      <div class="input-group">
        <label>新密码</label>
        <n-input v-model:value="form.password" type="password" show-password-on="mousedown" size="large" />
      </div>

      <div class="input-group">
        <label>确认新密码</label>
        <n-input v-model:value="form.confirmPassword" type="password" show-password-on="mousedown" size="large" />
      </div>

      <div v-if="uiStore.authMessage" class="status-msg"
        :class="{ 'error': uiStore.isLoginError, 'success': !uiStore.isLoginError }">
        {{ uiStore.authMessage }}
      </div>

      <n-button block type="primary" size="large" :loading="isLoading" :color="themeStore.themeColor"
        style="height: 50px; font-weight: bold;" @click="handleSubmit">
        {{ props.isChangePassword ? '修改密码' : '确认重置' }}
      </n-button>

      <div class="switch-mode">
        {{ props.isChangePassword ? '返回登录' : '想起密码了?' }} <span class="link" :style="{ color: themeStore.themeColor }"
          @click="emit('switch-view', 'login')">{{ props.isChangePassword ? '立即登录' : '立即登录' }}</span>
      </div>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
@use "./auth-shared.scss";
</style>
