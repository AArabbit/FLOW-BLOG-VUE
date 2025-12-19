<script setup lang="ts">
import { computed, onMounted, watch, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { NGrid, NGridItem, NAvatar, NButton, NEmpty } from 'naive-ui'
import gsap from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { usePagination } from '@/utils/usePagination'
import PostCard from '@/components/common/PostCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { getUser, normalizeBookmarks } from '@/api/auth'

defineOptions({ name: 'UserProfileView' })

const authStore = useAuthStore()
const postStore = usePostStore()
const themeStore = useThemeStore()
const bookmarkStore = useBookmarkStore()
const router = useRouter()

// 获取当前用户的收藏 ID 列表
const bookmarkIds = computed(() => authStore.user?.bookmarks || [])
const queryParams = reactive({
  ids: [] as number[]
})

// 标记是否已完成初始化
let isInitialized = false

// 刷新用户信息和收藏列表
const refreshUserBookmarks = async () => {
  if (!authStore.user) return
  try {
    const response = await getUser(authStore.user.id)
    const userInfo = response.userInfo
    const normalizedBookmarks = normalizeBookmarks(userInfo.bookmarks)
    // 更新 authStore 中的用户信息（包括 bookmarks）
    authStore.updateCurrentUser({
      ...userInfo,
      bookmarks: normalizedBookmarks
    })
  } catch (error) {
    console.error('Failed to refresh user bookmarks:', error)
  }
}

// 使用分页 Hook
const {
  list: posts,
  isLoading,
  isInitialLoad,
  hasMore,
  sentinelRef,
  loadData,
  initObserver
} = usePagination((page) => postStore.fetchPosts({
  page,
  pageSize: 12,
  ids: queryParams.ids
}))

// 处理移除收藏
const handleUnbookmark = async (e: Event, id: number) => {
  e.stopPropagation()
  //  调用 Store 移除数据
  await bookmarkStore.toggleBookmark(id)
}

// 监听 bookmarkIds 变化，重新加载文章列表
watch(bookmarkIds, async (newIds, oldIds) => {
  // 更新查询参数
  queryParams.ids = [...newIds]
  if (isInitialized) {
    await loadData(true)
  }
}, { deep: true })

// 监听列表变化，执行进场动画
watch(() => posts.value.length, () => {
  nextTick(() => {
    gsap.fromTo('.grid-item:not(.animated)',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
        onComplete: function () {
          (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated'))
        }
      }
    )
  })
})

onMounted(async () => {
  // 未登录重定向
  if (!authStore.user) {
    router.push('/')
    return
  }

  // 刷新用户信息获取最新的收藏列表
  await refreshUserBookmarks()

  // 初始化查询参数
  queryParams.ids = [...bookmarkIds.value]

  // 初始加载
  await loadData(true)
  initObserver()

  // 标记初始化完成
  isInitialized = true

  // 头部进场动画
  gsap.from('.profile-header', { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" })
})
</script>

<template>
  <div class="view-container">

    <div class="profile-header" v-if="authStore.user">
      <div class="avatar-wrapper">
        <n-avatar round :src="authStore.user.avatar" :size="120" />
      </div>
      <div class="info-content">
        <h1 class="username">Hello, {{ authStore.user.name }}</h1>
        <p class="role-tag">
          <span class="dot" :style="{ background: themeStore.themeColor }"></span>
          {{ authStore.user.role === 'admin' ? 'Administrator' : 'Community Member' }}
        </p>
      </div>
    </div>

    <div class="bookmarks-section">
      <div class="section-header">
        <h2 class="section-title">我的收藏</h2>
      </div>
      <div class="divider"></div>

      <n-grid x-gap="32" y-gap="40" cols="1 s:1 m:2 l:3 xl:4" responsive="screen">

        <n-grid-item v-for="post in posts" :key="post.id" class="grid-item">
          <PostCard :post="post" />
        </n-grid-item>

        <template v-if="isInitialLoad">
          <!-- 骨架屏改为 8 个 (2行 * 4列) -->
          <n-grid-item v-for="n in 8" :key="`s-${n}`">
            <SkeletonCard />
          </n-grid-item>
        </template>

      </n-grid>

      <div v-if="!isInitialLoad && posts.length === 0" class="empty-state">
        <n-empty description="暂无收藏文章" size="large">
          <template #extra>
            <n-button @click="router.push('/featured')">去发现好文</n-button>
          </template>
        </n-empty>
      </div>

      <div ref="sentinelRef" class="sentinel">
        <LoadingSpinner v-if="isLoading && !isInitialLoad" size="small" />
        <span v-if="!hasMore && !isInitialLoad && posts.length > 0" class="no-more">列表结束</span>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.view-container {
  min-height: 80vh;
  padding-top: 140px;
  padding-bottom: 80px;
  padding-left: 5vw;
  padding-right: 5vw;
}

.profile-header {
  @include flex(flex-start, center);
  gap: 40px;
  margin-bottom: 80px;

  @include mobile {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

.avatar-wrapper {
  border: 4px solid var(--card-bg);
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.username {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 10px;
}

.role-tag {
  font-family: $font-main;
  font-size: 0.9rem;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 8px;

  @include mobile {
    justify-content: center;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.section-header {
  margin-bottom: 15px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
  }
}

.divider {
  width: 100%;
  height: 1px;
  background: var(--border-light);
  margin-bottom: 40px;
}

.remove-btn {
  height: 56px;
  padding: 0 24px;
  border-radius: 28px;
  transform: scale(0.5) rotateZ(0.1deg);
  transform-origin: top right;
  will-change: transform;
  font-size: 24px;
  font-weight: 500;
  // background: #ffffff;
  background: rgba(255, 255, 255, 0.95);

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: none;

  // --- 渲染质量提示 ---
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
  perspective: 1000px;

  // Naive UI 内部元素调整
  :deep(.n-button__icon) {
    font-size: 28px;
    margin-right: 6px;
    // 强制图标重绘
    transform: translateZ(0);
  }

  :deep(.n-button__content) {
    line-height: 1;
    // 强制文字抗锯齿
    text-rendering: optimizeLegibility;
  }
}

.empty-state {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}

.sentinel {
  height: 80px;
  @include flex(center, center);
  width: 100%;
  margin-top: 20px;
}

.no-more {
  color: var(--text-sub);
  font-size: 0.9rem;
  font-family: $font-main;
  opacity: 0.6;
}
</style>
