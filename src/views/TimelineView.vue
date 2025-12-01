<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NTag } from 'naive-ui'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 必须声明组件名称，供 KeepAlive 缓存使用
defineOptions({ name: 'TimelineView' })

gsap.registerPlugin(ScrollTrigger)

const postStore = usePostStore()
const themeStore = useThemeStore()
const router = useRouter()
const isLoading = ref(true)

// 数据结构
const timelineData = ref<{ year: string, posts: any[] }[]>([])

onMounted(async () => {
  isLoading.value = true

  // 模拟从后端异步请求数据
  const groupedData = await postStore.fetchTimelinePosts()

  // 处理数据结构：按年份倒序
  const sortedYears = Object.keys(groupedData).sort((a, b) => Number(b) - Number(a))
  timelineData.value = sortedYears.map(year => ({
    year,
    posts: groupedData[year]
  }))

  isLoading.value = false

  // 2. 动画初始化
  nextTick(() => {
    initAnimations()
  })
})

const initAnimations = () => {
  // 中轴线生长动画
  gsap.fromTo('.center-line',
    { scaleY: 0, transformOrigin: 'top' },
    { scaleY: 1, duration: 2, ease: "power3.inOut" }
  )

  // 年份水印视差
  gsap.utils.toArray('.year-watermark').forEach((el: any) => {
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
            :class="index % 2 === 0 ? 'left-side' : 'right-side'" @click="router.push(`/article/${post.id}`)">
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.view-container {
  padding-bottom: 150px;
  overflow-x: hidden;
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
  margin-bottom: 150px;
}

// --- 🌟 核心修复：年份文字样式 ---
.year-watermark {
  position: absolute;
  top: -80px; // 位置修正
  left: 50%;
  transform: translateX(-50%);

  font-family: $font-main;
  font-size: 12rem;
  font-weight: 800;
  line-height: 1;

  // 🔴 改用实心颜色 + 低透明度，确保可见性
  color: var(--text-main);
  opacity: 0.06; // 6% 不透明度，作为背景纹理

  z-index: 0;
  pointer-events: none;
  white-space: nowrap;
}

// --- 卡片项 ---
.timeline-item {
  position: relative;
  width: 50%;
  padding-bottom: 80px;
  box-sizing: border-box;
  z-index: 2; // 内容在文字之上
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
