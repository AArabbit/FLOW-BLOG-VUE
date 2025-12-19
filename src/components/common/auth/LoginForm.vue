<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NInput, NSpace, NSpin } from 'naive-ui' // 引入 NSpin
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { PhGithubLogo } from '@phosphor-icons/vue'

const emit = defineEmits(['switch-view'])
const authStore = useAuthStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()

const form = ref({ username: '', password: '' })
const isLoading = ref(false)
const isGithubLoading = ref(false)

// 密码登录提交
const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    uiStore.setAuthError('请输入用户名和密码')
    return
  }
  isLoading.value = true
  await authStore.login(form.value)
  isLoading.value = false
}

// GitHub 登录点击事件
const handleGithubLogin = async () => {
  isGithubLoading.value = true
  try {
    // 等待新窗口关闭并传回消息
    // 如果成功，authStore 内部会关闭模态框，组件销毁，loading 自然消失
    // 如果失败或取消，会继续执行下面的 finally
    await authStore.loginWithGithub()
  } finally {
    // 只有在未成功（即还在当前页面）的情况下，才需要手动取消 loading
    // 如果登录成功跳转或模态框关闭了，这里执行也无妨
    isGithubLoading.value = false
  }
}
</script>

<template>
  <div class="form-wrapper">
    <!-- 使用 NSpin 包裹内容，实现全屏遮罩 Loading -->
    <n-spin :show="isGithubLoading" description="正在连接 GitHub..." size="large">
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

        <div class="form-footer">
          <!-- 
            GitHub 按钮修改：
            1. text: 去除背景和边框
            2. type="default": 使用默认文字颜色（通常是深灰/黑）
            3. icon-placement: 仅仅作为图标容器
          -->
          <n-button 
            text 
            size="large" 
            @click="handleGithubLogin"
            title="使用 GitHub 登录"
            class="github-btn"
          >
            <template #icon>
              <!-- weight="fill" 改为实心图标，增大尺寸 -->
              <PhGithubLogo weight="fill" :size="28" />
            </template>
          </n-button>

          <div class="register-link">
            还没有账号? 
            <span class="link" :style="{ color: themeStore.themeColor }" @click="emit('switch-view', 'register')">
              注册新账号
            </span>
          </div>
        </div>
      </n-space>
    </n-spin>
  </div>
</template>

<style lang="scss" scoped>
@use "./auth-shared.scss";

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  // 增加一点底部内边距，防止 Loading 遮罩时显得太拥挤
  padding-bottom: 5px;

  .github-btn {
    // 增加鼠标悬停效果，稍微变色提示可点击
    transition: opacity 0.3s;
    &:hover {
      opacity: 0.7;
    }
  }

  .register-link {
    font-size: 0.9rem;
    color: var(--text-sub);

    .link {
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      margin-left: 5px;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>