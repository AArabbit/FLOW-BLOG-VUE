<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { useUIStore } from '@/stores/ui'

// 引入拆分后的组件
import AuthContainer from './auth/AuthContainer.vue'
import LoginForm from './auth/LoginForm.vue'
import RegisterForm from './auth/RegisterForm.vue'
import ResetForm from './auth/ResetForm.vue'

const uiStore = useUIStore()
const contentRef = ref<HTMLElement | null>(null)

// 视图状态管理
type ViewMode = 'login' | 'register' | 'forgot'
const viewMode = ref<ViewMode>('login')

// 计算标题
const title = computed(() => {
  switch (viewMode.value) {
    case 'register': return '欢迎注册'
    case 'forgot': return '重置密码'
    default: return '欢迎回来'
  }
})

const subtitle = computed(() => {
  switch (viewMode.value) {
    case 'register': return ''
    case 'forgot': return '通过邮箱找回您的账号'
    default: return '请登录以发表您的观点'
  }
})

// 监听弹窗打开，重置为登录页
watch(() => uiStore.showLoginModal, (val) => {
  if (val) {
    viewMode.value = 'login'
    uiStore.resetAuthStatus()
  }
})

// 切换视图的平滑过渡动画
const handleSwitch = (mode: ViewMode) => {
  gsap.to(contentRef.value, {
    opacity: 0,
    y: 10,
    duration: 0.2,
    onComplete: () => {
      viewMode.value = mode
      uiStore.resetAuthStatus()

      // 重新渲染并进场
      nextTick(() => {
        gsap.fromTo(contentRef.value,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, clearProps: 'all' }
        )
      })
    }
  })
}

// 注册/重置成功后，延迟跳转回登录
const handleSuccess = () => {
  setTimeout(() => handleSwitch('login'), 1000)
}

const close = () => uiStore.toggleLoginModal(false)
</script>

<template>
  <AuthContainer :show="uiStore.showLoginModal" :title="title" :subtitle="subtitle" @close="close">
    <div ref="contentRef">
      <LoginForm v-if="viewMode === 'login'" @switch-view="handleSwitch" />

      <RegisterForm v-if="viewMode === 'register'" @switch-view="handleSwitch" @success="handleSuccess" />

      <ResetForm v-if="viewMode === 'forgot'" @switch-view="handleSwitch" @success="handleSuccess" />
    </div>
  </AuthContainer>
</template>
