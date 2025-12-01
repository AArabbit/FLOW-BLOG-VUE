<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
  active: boolean
}

const tocItems = ref<TocItem[]>([])
const activeId = ref<string>('')
let observer: IntersectionObserver | null = null

const initTOC = () => {
  // 扫描 .article-body 下的标题
  const headings = document.querySelectorAll('.article-body h2, .article-body h3')
  const items: TocItem[] = []

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`
    }
    items.push({
      id: heading.id,
      text: (heading as HTMLElement).innerText,
      level: Number(heading.tagName.substring(1)),
      active: false
    })
  })

  tocItems.value = items

  if (observer) observer.disconnect()

  const options = {
    rootMargin: '-100px 0px -60% 0px',
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
  activeId.value = id
  const element = document.getElementById(id)
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

onMounted(() => {
  // 确保父组件和兄弟组件渲染完毕
  nextTick(() => {
    initTOC()
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <aside class="toc-sidebar">
    <div class="toc-container">
      <div class="toc-header">目录</div>
      <ul class="toc-list">
        <li v-for="item in tocItems" :key="item.id" class="toc-item" :class="{
          'active': activeId === item.id,
          'level-2': item.level === 2,
          'level-3': item.level === 3
        }" @click="scrollToHeading(item.id)">
          <span class="toc-text">{{ item.text }}</span>
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
  top: 120px;
  padding-left: 20px;
  border-left: 1px solid var(--border-light);

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
  gap: 12px;
}

.toc-item {
  font-size: 0.95rem;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 10px;

  &.level-3 {
    padding-left: 25px;
    font-size: 0.9rem;
  }

  &:hover {
    color: var(--primary-color);
  }

  &.active {
    color: var(--primary-color);
    font-weight: 700;
    transform: translateX(5px);

    &::before {
      content: '';
      position: absolute;
      left: -21px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 100%;
      background: var(--primary-color);
    }
  }
}
</style>
