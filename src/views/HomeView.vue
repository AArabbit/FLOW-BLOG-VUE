<script setup lang="ts">
import { onMounted, nextTick, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NGrid, NGridItem } from 'naive-ui'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useHead } from '@vueuse/head'
import { usePostStore } from '@/stores/posts'
import { useAuthStore } from '@/stores/auth'
import { useArticleModalStore } from '@/stores/articleModal'
import { getUser, normalizeBookmarks } from '@/api/auth'
import { getDocs } from '@/api/docs'
import type { CategoryItem } from '@/api/docs'
import type { Post } from '@/types'

import PostCard from '@/components/common/PostCard.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import HeroGame from '@/components/common/HeroGame.vue'
import AwardsWheel from '@/components/common/AwardsWheel.vue'
import MoreButton from '@/components/common/MoreButton.vue'

defineOptions({ name: 'HomeView' })

gsap.registerPlugin(ScrollTrigger)

const postStore = usePostStore()
const router = useRouter()
const authStore = useAuthStore()
const articleModalStore = useArticleModalStore()

useHead({ title: '首页 | FLOW BLOG' })

const goToArticles = () => {
  router.push('/articles')
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

const postsPreview = ref<Post[]>([])
const isLoadingPreview = ref(true)
const docItems = ref<CategoryItem[]>([])

const loadPreview = async () => {
  isLoadingPreview.value = true
  try {
    const res = await postStore.fetchPosts({ page: 1, pageSize: 4 })
    postsPreview.value = res.list
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingPreview.value = false
  }
}

onMounted(async () => {
  if (authStore.user) {
    try {
      const response = await getUser(authStore.user.id)
      const userInfo = response.userInfo
      const normalizedBookmarks = normalizeBookmarks(userInfo.bookmarks)
      authStore.updateCurrentUser({ bookmarks: normalizedBookmarks })
    } catch (error) {
      console.error(error)
    }
  }
  await loadPreview()
  // 加载常用文档数据并传给AwardsWheel
  try {
    const docsRes = await getDocs()
    if (docsRes && docsRes.docList) {
      docItems.value = docsRes.docList
    }
  } catch (e) {
    console.error('Failed to load docs in HomeView:', e)
  }
  nextTick(() => animateNewItems())
})

const activeCategoryId = ref<number | 'all'>('all');
const displayedCategoryId = ref<number | 'all'>('all');
const awardsWheelRef = ref<any>(null);
const isSwitching = ref(false);

const handleOpenPost = (post: Post) => {
  articleModalStore.open(post.id)
}

const handleCategoryClick = async (id: number | 'all') => {
  activeCategoryId.value = id;

  if (displayedCategoryId.value === id || isSwitching.value) return;

  isSwitching.value = true;

  if (awardsWheelRef.value) {
    await awardsWheelRef.value.animateExit();
  }

  displayedCategoryId.value = id;

  await nextTick();

  if (awardsWheelRef.value) {
    await awardsWheelRef.value.animateEnter();
  }

  isSwitching.value = false;
};

const filteredDocItems = computed(() => {
  if (displayedCategoryId.value === 'all') {
    return docItems.value.flatMap(cat => cat.docs);
  } else {
    const category = docItems.value.find(cat => cat.id === displayedCategoryId.value);
    return category ? category.docs : [];
  }
});

const animateNewItems = () => {
  gsap.fromTo('.featured-item:not(.animated)',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
      onComplete: function () {
        (this.targets() as HTMLElement[]).forEach(el => el.classList.add('animated'))
      }
    }
  )
}
</script>

<template>
  <div class="view-container">
    <!-- Hero -->
    <section class="hero-section">
      <HeroGame />
    </section>

    <!-- 最新文章 -->
    <section class="featured container-limit">
      <div class="section-header">
        <h2>最新文章</h2><span class="line"></span>
      </div>

      <n-grid x-gap="0" y-gap="20" cols="1 s:1 m:2 l:3 xl:4" responsive="screen">
        <n-grid-item v-for="post in postsPreview" :key="post.id" class="featured-item">
           <PostCard :post="post" @click-post="handleOpenPost" />
        </n-grid-item>
        <template v-if="isLoadingPreview">
          <n-grid-item v-for="n in 4" :key="`s-${n}`">
            <SkeletonCard />
          </n-grid-item>
        </template>
      </n-grid>

      <div class="more-actions">
        <MoreButton @click="goToArticles" />
      </div>
    </section>

    <!-- 常用文档 -->
    <section class="docs-section">
      <div class="container-limit section-header-wrapper">
        <div class="section-header">
          <h2>文档</h2><span class="line"></span>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
          <div class="tab-item" :class="{ active: activeCategoryId === 'all' }" @click="handleCategoryClick('all')">
            全部
          </div>
          <div v-for="cat in docItems" :key="cat.id" class="tab-item" :class="{ active: activeCategoryId === cat.id }"
            @click="handleCategoryClick(cat.id)">
            {{ cat.name }}
          </div>
        </div>
      </div>

      <div class="wheel-container-full">
        <AwardsWheel ref="awardsWheelRef" :items="filteredDocItems" :radius="1500" :angle-step="16" :card-width="320"
          :card-height="380" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.view-container {
  min-height: 100vh;
  overflow-y: hidden;
  width: 100%;
}

.view-container::-webkit-scrollbar {
  display: none;
}

.hero-section {
  width: 100%;
  position: relative;
  margin-top: 20px;
  margin-bottom: 30px;
}

/* 限制宽度的容器类 */
.container-limit {
  // max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
  box-sizing: border-box;
}

.featured {
  margin-bottom: 80px;
}

.more-actions {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.docs-section {
  width: 100%;
  margin-bottom: 80px;
  position: relative;
}

/* 标题区域 */
.section-header-wrapper {
  position: relative;
  z-index: 10;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 0px;

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap;
  }

  .line {
    flex: 1;
    height: 1px;
    background: var(--border-light);
    opacity: 0.6;
  }

  opacity: 0.6;
}


.category-tabs {
  display: flex;
  gap: 15px;
  background: rgba(var(--bg-card-rgb), 0.5);
  backdrop-filter: blur(10px);
  padding: 4px;
  border-radius: 99px;
  margin-left: auto;
  margin-top: 50px;
  margin-bottom: 50px;
}

.tab-item {
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item:hover {
  color: var(--text-main);
  background: rgba(0, 0, 0, 0.05);
  /* Generic hover */
}

.tab-item.active {
  color: #fff;
  background: var(--primary-color);
  font-weight: 500;
}

/* 轮盘专用全屏容器 */
.wheel-container-full {
  width: 100%;
  height: 550px;
  position: relative;
  // overflow: visible;
  overflow: hidden;
  z-index: 1;
}



@media (max-width: 768px) {
  .container-limit {
    padding: 0 20px;
  }

  .wheel-container-full {
    height: 600px;
  }
}
</style>