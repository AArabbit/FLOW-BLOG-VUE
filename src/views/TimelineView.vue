<script setup lang="ts">
import { onMounted, nextTick, ref, computed, onUnmounted } from 'vue'
import { NTag } from 'naive-ui'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import { useArticleModalStore } from '@/stores/articleModal'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Post } from '@/types'

defineOptions({ name: 'TimelineView' })

gsap.registerPlugin(ScrollTrigger)

const postStore = usePostStore()
const themeStore = useThemeStore()
const articleModalStore = useArticleModalStore()

// 状态管理
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const postList = ref<Post[]>([])

// 观察器
let observer: IntersectionObserver | null = null
const loadingTrigger = ref<HTMLElement | null>(null)

const handleOpenPost = (id: number) => {
  articleModalStore.open(id)
}

// 计算属性：按年份分组
const timelineData = computed(() => {
  const grouped: Record<string, Post[]> = {}
  postList.value.forEach(post => {
    const year = post.date.substring(0, 4)
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(post)
  })

  // 按年份倒序排序
  return Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({
      year,
      posts: grouped[year]
    }))
})

// 加载数据
const loadPosts = async (page: number, isInitial = false) => {
  if (isInitial) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const res = await postStore.fetchPosts({
      page,
      pageSize: 12
    })

    if (res.list && res.list.length > 0) {
      if (isInitial) {
        postList.value = res.list
      } else {
        // 去重添加
        const existingIds = new Set(postList.value.map(p => p.id))
        const newPosts = res.list.filter(p => !existingIds.has(p.id))
        postList.value.push(...newPosts)
      }
      hasMore.value = res.hasMore
      // 如果还有更多数据，页码+1
      if (res.hasMore) {
        currentPage.value++
      }
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to load timeline posts:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false

    // 数据更新后刷新动画配置
    nextTick(() => {
      ScrollTrigger.refresh()
      if (isInitial) {
        initAnimations()
      }
    })
  }
}

// 初始化观察器
const initObserver = () => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value && !isLoadingMore.value) {
      loadPosts(currentPage.value)
    }
  }, {
    threshold: 0.1,
    rootMargin: '100px'
  })

  if (loadingTrigger.value) {
    observer.observe(loadingTrigger.value)
  }
}

onMounted(async () => {
  await loadPosts(1, true)

  // 初始化观察器
  nextTick(() => {
    initObserver()
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const initAnimations = () => {
  // 中轴线生长动画
  gsap.fromTo('.center-line',
    { scaleY: 0, transformOrigin: 'top' },
    { scaleY: 1, duration: 2, ease: "power3.inOut" }
  )

  // 年份水印视差
  setTimeout(() => {
    bindScrollEffects()
  }, 100)
}

// 绑定滚动特效
const bindScrollEffects = () => {
  // 年份视差
  gsap.utils.toArray('.year-watermark').forEach((el: any) => {
    if (el.dataset.bound) return
    el.dataset.bound = "true"

    gsap.to(el, {
      y: 150, // 视差移动距离
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    })
  })

  // 卡片交错进场
  const items = gsap.utils.toArray('.timeline-item')
  items.forEach((item: any) => {
    if (item.dataset.bound) return
    item.dataset.bound = "true"

    const isLeft = item.classList.contains('left-side')

    gsap.fromTo(item,
      {
        opacity: 0,
        x: isLeft ? -50 : 50,
        y: 50,
        filter: 'blur(5px)'
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    )
  })
}

// 监听 postList 变化，重新绑定新增元素的动画
import { watch } from 'vue'
watch(() => postList.value.length, () => {
  nextTick(() => {
    bindScrollEffects()
  })
})

</script>

<template>
  <div class="view-container">

    <div class="header-area">
      <h1 class="page-title">时间线</h1>
      <p class="page-subtitle">记录思维的每一次跳动</p>
    </div>

    <div v-if="isLoading" class="loading-wrapper">
      <LoadingSpinner size="large" />
    </div>

    <div v-else class="timeline-container">
      <div class="center-line"></div>

      <div v-for="group in timelineData" :key="group.year" class="year-section">

        <div class="year-watermark">{{ group.year }}</div>

        <div class="posts-list">
          <div v-for="(post, index) in group.posts" :key="post.id" class="timeline-item"
            :class="(postList.indexOf(post)) % 2 === 0 ? 'left-side' : 'right-side'" @click="handleOpenPost(post.id)">

            <div class="dot-wrapper">
              <div class="dot" :style="{ borderColor: themeStore.themeColor }"></div>
              <div class="connector-line"></div>
            </div>

            <div class="content-card">
              <div class="card-header">
                <span class="date">{{ post.date.substring(5) }}</span>
                <n-tag :bordered="false" size="tiny" class="cat-tag">{{ post.category.name }}</n-tag>
              </div>
              <h3 class="title">{{ post.title }}</h3>
              <p class="desc">{{ post.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多触发器 -->
      <div ref="loadingTrigger" class="load-more-trigger">
        <LoadingSpinner v-if="isLoadingMore" size="small" />
        <p v-if="!hasMore && postList.length > 0" class="no-more">—— 已展示全部内容 ——</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.view-container {
  padding-bottom: 150px;
  overflow-x: hidden;
  min-height: 100vh;
}

.header-area {
  text-align: center;
  margin-bottom: 120px;

  .page-title {
    font-size: clamp(3.5rem, 8vw, 7rem);
    font-weight: 800;
    margin-bottom: 10px;
    color: var(--text-main);
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .page-subtitle {
    font-family: $font-main;
    color: var(--text-sub);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

.timeline-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

// --- 中轴线 ---
.center-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom,
      transparent 0%,
      var(--border-light) 10%,
      var(--border-light) 90%,
      transparent 100%);
  z-index: 0;
}

.year-section {
  position: relative;
  margin-bottom: 100px;
  /* Reduced from 150px */
}

// 年份文字样式
.year-watermark {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);

  font-family: $font-main;
  font-size: 12rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-main);
  opacity: 0.06;

  z-index: 0;
  pointer-events: none;
  white-space: nowrap;
}

// --- 卡片项 ---
.timeline-item {
  position: relative;
  width: 50%;
  // padding-bottom: 40px;
  /* Reduced from 80px */
  box-sizing: border-box;
  z-index: 2;
  cursor: pointer;

  &.left-side {
    left: 0;
    text-align: right;
    padding-right: 60px;

    .dot-wrapper {
      right: -6px;
      flex-direction: row-reverse;
    }

    .content-card {
      margin-left: auto;
      transform-origin: right center;
    }
  }

  &.right-side {
    left: 50%;
    text-align: left;
    padding-left: 60px;

    .dot-wrapper {
      left: -6px;
      flex-direction: row;
    }

    .content-card {
      margin-right: auto;
      transform-origin: left center;
    }
  }

  &:hover {
    .dot {
      background: var(--bg-color);
      transform: scale(1.4);
    }

    .connector-line {
      width: 40px;
      background: var(--primary-color);
      opacity: 1;
    }

    .content-card {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(0, 0, 0, 0);
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.15);

      .title {
        color: var(--primary-color);
      }
    }
  }
}

// --- 连接组件 ---
.dot-wrapper {
  position: absolute;
  top: 30px;
  display: flex;
  align-items: center;
  width: 60px;

  .dot {
    width: 12px;
    height: 12px;
    background: var(--bg-color);
    border: 3px solid; // 颜色由 inline style 绑定
    border-radius: 50%;
    z-index: 2;
    transition: all 0.4s $ease-smooth;
    flex-shrink: 0;
  }

  .connector-line {
    height: 1px;
    width: 20px;
    background: var(--border-light);
    transition: all 0.4s $ease-smooth;
    opacity: 0.5;
  }
}

// --- 极简卡片 ---
.content-card {
  background: var(--card-bg);

  // 毛玻璃增强质感
  @supports (backdrop-filter: blur(10px)) {
    background: color-mix(in srgb, var(--card-bg), transparent 15%);
    backdrop-filter: blur(12px);
  }

  padding: 35px;
  border-radius: 2px;
  border: 1px solid var(--border-light);
  transition: all 0.5s $ease-smooth;
  max-width: 450px;

  .card-header {
    @include flex(flex-start, center);
    gap: 12px;
    margin-bottom: 16px;
    flex-direction: inherit; // 继承对齐

    .date {
      font-family: $font-main;
      color: var(--text-sub);
      font-size: 0.85rem;
      opacity: 0.8;
    }

    .cat-tag {
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-main);
      font-weight: 700;
    }
  }

  .title {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 12px;
    color: var(--text-main);
    transition: color 0.3s;
  }

  .desc {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-sub);
    @include text-clamp(2);
  }
}

.left-side .card-header {
  flex-direction: row-reverse;
}

.loading-wrapper {
  height: 60vh;
  @include flex(center, center);
}

.load-more-trigger {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
}

.no-more {
  color: var(--text-sub);
  opacity: 0.6;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

// --- 移动端 ---
@include mobile {
  .center-line {
    left: 20px;
  }

  .year-watermark {
    font-size: 6rem;
    top: -50px;
    left: 20px;
    transform: none;
    text-align: left;
  }

  .timeline-item {
    width: 100%;
    left: 0 !important;
    text-align: left !important;
    padding-left: 60px;
    padding-right: 0;

    .dot-wrapper {
      left: 14px;
      right: auto;
      flex-direction: row;
    }

    .content-card {
      margin: 0;
      max-width: 100%;

      .card-header {
        flex-direction: row;
      }
    }
  }
}
</style>
