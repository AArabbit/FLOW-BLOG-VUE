<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NAvatar, NDropdown } from 'naive-ui'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui' 

const router = useRouter()
const postStore = usePostStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const uiStore = useUIStore() // 初始化

// 修改打开逻辑
const openSettings = () => {
  uiStore.toggleSettings(true)
}

const userOptions = [{ label: '个人中心', key: 'profile' }, { label: '退出登录', key: 'logout' }]
const handleUserSelect = (key: string) => {
  if (key === 'logout') { authStore.logout(); router.push('/') }
  else if (key === 'profile') router.push('/profile')
}

const adminOptions = [{ label: '文章管理', key: 'posts' }, { label: '用户管理', key: 'users' }]
const handleAdminSelect = (key: string) => {
  if (key === 'posts') router.push('/admin/posts')
  if (key === 'users') router.push('/admin/users')
}
</script>

<template>
  <nav class="nav-container">
    <div class="logo" @click="router.push('/')">
      FLOW<span :style="{ color: themeStore.themeColor }">.</span>BLOG
    </div>

    <div class="menu">
      <router-link to="/" class="menu-item" active-class="active">首页</router-link>
      <router-link to="/featured" class="menu-item" active-class="active">精选</router-link>
      <router-link to="/timeline" class="menu-item" active-class="active">时间轴</router-link>

      <div class="menu-item dropdown">
        <span>分类探索</span>
        <div class="dropdown-content">
          <router-link v-for="cat in postStore.categories" :key="cat.id" :to="`/category/${cat.id}`">
            {{ cat.name }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="actions">
      <n-dropdown v-if="authStore.user?.role === 'admin'" :options="adminOptions" @select="handleAdminSelect">
        <n-button round secondary type="primary" size="small" style="margin-right: 12px; font-weight: bold;">
          <template #icon><i class="ph ph-kanban"></i></template> 管理控制台
        </n-button>
      </n-dropdown>

      <n-button circle secondary @click="themeStore.toggleSearch(true)" style="margin-right: 12px;">
        <template #icon><i class="ph ph-magnifying-glass" style="font-size: 20px;"></i></template>
      </n-button>

      <div class="user-action" style="margin-right: 12px; display: inline-flex;">
        <n-dropdown v-if="authStore.user" :options="userOptions" @select="handleUserSelect">
          <n-avatar round :src="authStore.user.avatar" size="small" style="cursor: pointer;" />
        </n-dropdown>
        <n-button v-else size="small" round secondary @click="uiStore.toggleLoginModal(true)">Login</n-button>
      </div>

      <n-button circle secondary @click="openSettings">
        <template #icon><i class="ph ph-gear" style="font-size: 20px;"></i></template>
      </n-button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  @include flex-between;
  padding-left: 5vw;
  padding-right: calc(5vw + var(--scrollbar-gap, 0px));
  z-index: z('navbar');
  @include glass-effect;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}

.logo {
  font-family: $font-main;
  font-weight: 700;
  font-size: 1.5rem;
  cursor: pointer;
  letter-spacing: -0.05em;
  user-select: none;
  color: var(--text-main);
}

.menu {
  @include flex(center, center);
  gap: 40px;

  @include mobile {
    display: none;
  }
}

.menu-item {
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
  transition: color 0.3s;
  cursor: pointer;
  color: var(--text-main);

  &:hover,
  &.active {
    color: var(--primary-color);
  }

  &:not(.dropdown).active::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--primary-color);
  }
}

.dropdown {
  position: relative;
  padding: 10px 0;
  cursor: pointer;

  span {
    transition: color 0.3s;
  }

  &:hover span {
    color: var(--primary-color);
  }

  .dropdown-content {
    @include abs-center;
    @include flex-col;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    padding: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    min-width: 140px;
    gap: 5px;
    border: 1px solid var(--border-light);
    z-index: z('dropdown');
    display: none;
  }

  &:hover .dropdown-content {
    display: flex;
  }

  .dropdown-content a {
    padding: 10px 16px;
    font-size: 0.9rem;
    color: var(--text-sub);
    border-radius: 6px;
    white-space: nowrap;
    text-align: center;

    &:hover {
      background: rgba(125, 125, 125, 0.1);
      color: var(--primary-color);
    }
  }
}

.actions {
  @include flex(center, center);
  gap: 12px;
}
</style>
