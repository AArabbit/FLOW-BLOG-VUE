import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

// 组件懒加载
const HomeView = () => import('@/views/HomeView.vue')
const FeaturedView = () => import('@/views/FeaturedView.vue')
const TimelineView = () => import('@/views/TimelineView.vue')
const CategoryView = () => import('@/views/CategoryView.vue')
const UserProfileView = () => import('@/views/UserProfileView.vue')
const ArticleView = () => import('@/views/ArticleView.vue')
const PostManagerView = () => import('@/views/admin/PostManagerView.vue')
const UserManagerView = () => import('@/views/admin/UserManagerView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/featured',
      name: 'featured',
      component: FeaturedView
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelineView
    },
    {
      path: '/category/:id',
      name: 'category',
      component: CategoryView
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView
    },
    {
      path: '/article/:id',
      name: 'article',
      component: ArticleView
    },
    {
      path: '/admin/posts',
      name: 'admin-posts',
      component: PostManagerView,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: UserManagerView,
      meta: { requiresAdmin: true }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫与缓存控制
router.beforeEach((to, from, next) => {
  const themeStore = useThemeStore()
  const authStore = useAuthStore()

  // 定义列表页组件名称白名单
  const listViews = ['HomeView', 'FeaturedView', 'TimelineView', 'CategoryView', 'UserProfileView']

  // 安全获取来源组件的名称
  // 会获取 components.default，并断言其可能包含 name 属性
  const comp = from.matched[0]?.components?.default
  const rawName = comp && typeof comp === 'object' && 'name' in comp ? comp.name : undefined
  const fromName = typeof rawName === 'string' ? rawName : undefined

  // 2. 智能缓存逻辑
  if (fromName && listViews.includes(fromName)) {
    // 情况 A: 从列表页 -> 详情页 (Article)
    // 动作：加入缓存，保留滚动位置
    if (to.name === 'article') {
      themeStore.addCachedView(fromName)
    }
    // 情况 B: 从列表页 -> 其他页面 (比如 Home -> Featured)
    // 动作：移除缓存，确保下次进入是刷新状态
    else if (to.name !== 'article') {
      themeStore.removeCachedView(fromName)
    }
  }

  // 3. 权限控制
  if (to.meta.requiresAdmin) {
    if (authStore.user?.role === 'admin') {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
