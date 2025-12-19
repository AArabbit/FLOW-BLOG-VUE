<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject, Ref } from 'vue'
import { useRoute } from 'vue-router'
import type Lenis from 'lenis'

interface TocItem {
  id: string
  text: string
  level: number
  active: boolean
}

// 接收父组件传入的滚动容器元素
const props = defineProps<{
  scrollElement?: HTMLElement | null
}>()


const globalLenis = inject<Ref<Lenis | null> | null>('globalLenis', null)
const localLenis = inject<Ref<Lenis | null> | null>('localLenis', null)

const route = useRoute()
const tocItems = ref<TocItem[]>([])
const activeId = ref<string>('')
let observer: IntersectionObserver | null = null
let retryCount = 0

const initTOC = () => {
  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
  if (headings.length === 0 && retryCount < 5) {
    retryCount++
    setTimeout(initTOC, 200) // 200ms 后重试
    return
  }

  const items: TocItem[] = []

  headings.forEach((heading, index) => {
    const el = heading as HTMLElement
    if (!el.id) {
      el.id = `heading-${index}`
    }
    items.push({
      id: el.id,
      text: el.innerText,
      level: Number(el.tagName.substring(1)),
      active: false
    })
  })

  tocItems.value = items
  setupIntersectionObserver(headings)
}

// 设置滚动监听
const setupIntersectionObserver = (headings: NodeListOf<Element>) => {
  if (observer) observer.disconnect()

  const options = {
    root: props.scrollElement || null,
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
      }
    })
  }, options)

  headings.forEach((h) => observer?.observe(h))
}

const scrollToHeading = (id: string) => {
  activeId.value = id // 点击高亮
  const currentLenis = localLenis?.value || globalLenis?.value
  if (currentLenis) {
    currentLenis.scrollTo(`#${id}`, {
      offset: -100, // 顶部留白
      duration: 1.2, // 可以自定义速度
      immediate: false,
    })
    return
  }
  // const element = document.getElementById(id)
  // if (element) {
  //   if (props.scrollElement) {
  //     // 模态框滚动
  //     // 计算元素相对于滚动容器顶部的距离
  //     const containerTop = props.scrollElement.getBoundingClientRect().top
  //     const elementTop = element.getBoundingClientRect().top
  //     // 当前滚动位置 + 相对距离 - 顶部留白(100px)
  //     const targetScroll = props.scrollElement.scrollTop + (elementTop - containerTop) - 100

  //     props.scrollElement.scrollTo({ top: targetScroll, behavior: 'smooth' })
  //   } else {
  //     // Window滚动
  //     const top = element.getBoundingClientRect().top + window.scrollY - 100
  //     window.scrollTo({ top, behavior: 'smooth' })
  //   }
  // }
}

onMounted(() => {
  retryCount = 0
})

// 监听路由变化重新生成目录
watch(() => route.path, () => {
  retryCount = 0
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

defineExpose({
  initTOC
})
</script>

<template>
  <aside class="toc-sidebar" v-if="tocItems.length > 0">
    <div class="toc-container">
      <div class="toc-header">目录</div>
      <ul class="toc-list">
        <li v-for="item in tocItems" :key="item.id" class="toc-item" :class="{
          'active': activeId === item.id,
          'level-1': item.level === 1,
          'level-2': item.level === 2,
          'level-3': item.level === 3
        }" @click="scrollToHeading(item.id)">
          <span class="toc-text" :title="item.text">{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.toc-sidebar {
  position: sticky;
  top: 40px; // 在模态框里，不需要计算 nav-bottom-pos，直接距容器顶部
  padding-left: 20px;
  border-left: 1px solid var(--border-light);
  max-height: calc(90vh - 60px); // 适配模态框高度
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @include mobile {
    display: none;
  }
}

.toc-header {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.toc-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
}

.toc-item {
  font-size: 0.9rem;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  line-height: 1.5;

  // 文字超出省略
  .toc-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // 层级缩进
  &.level-1 {
    padding-left: 0px;
    font-weight: 600;
  }

  &.level-2 {
    padding-left: 10px;
  }

  &.level-3 {
    padding-left: 25px;
    font-size: 0.85rem;
  }

  &:hover {
    color: var(--primary-color);
  }

  &.active {
    color: var(--primary-color);
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: -21px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: var(--primary-color);
      border-radius: 2px;
    }
  }
}
</style>