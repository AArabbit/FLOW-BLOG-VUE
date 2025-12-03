<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
// import 'prismjs/themes/prism-tomorrow.css'
// import 'prismjs/components/prism-javascript'
// import 'prismjs/components/prism-typescript'

const props = defineProps<{
  post: any
}>()

const router = useRouter()
const themeStore = useThemeStore()
const articleRef = ref<HTMLElement | null>(null)

// 注册“展开/收起”按钮
const registerCollapseButton = () => {
  if (!Prism.plugins.toolbar) return
  Prism.plugins.toolbar.registerButton('toggle-expand', {
    text: '收起',
    onClick: function (env: any) {
      // 父级 <pre>
      const pre = env.element.parentElement
      if (!pre) return

      // 切换 collapsed 类名
      const isCollapsed = pre.classList.toggle('code-collapsed')

      // 修改按钮文字
      const btn = env.button as HTMLButtonElement
      btn.textContent = isCollapsed ? '展开' : '收起'
    }
  })
}

// 执行高亮 
const highlightCode = () => {
  // await nextTick() 
  if (!articleRef.value) return

  registerCollapseButton() // 注册按钮
  Prism.highlightAllUnder(articleRef.value) // 只高亮文章内容区域
}

// 初始化 MarkdownIt
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const renderedContent = computed(() => {
  return props.post.content ? md.render(props.post.content) : ''
})

// 返回逻辑
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

defineExpose({
		highlightCode
	})
</script>

<template>
  <article class="article-main">
    <p class="lead">{{ post.desc }}</p>
    <div class="divider"></div>

    <!-- 动态渲染 Markdown 内容 -->
    <div class="article-body" v-html="renderedContent" ref="articleRef"></div>

    <div class="article-footer">
      <n-button secondary size="large" @click="handleBack" :style="{ '--n-text-color': themeStore.themeColor }">
        <template #icon><i class="ph ph-arrow-left"></i></template>
        返回
      </n-button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.article-main {
  min-width: 0;
  font-size: 1.15rem;
  line-height: 1.9;
  color: var(--text-main);

  .lead {
    font-size: 1.35rem;
    font-weight: 500;
    margin-bottom: 40px;
    color: var(--text-main);
  }

  .divider {
    width: 60px;
    height: 4px;
    background: var(--primary-color);
    margin: 40px 0;
  }

  // Markdown 样式适配
  :deep(.article-body) {

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--text-main);
      font-weight: 700;
      margin: 50px 0 25px;
      line-height: 1.3;
      scroll-margin-top: 100px;
    }

    h2 {
      font-size: 2rem;
    }

    h3 {
      font-size: 1.6rem;
    }

    h4 {
      font-size: 1.3rem;
    }

    p {
      margin-bottom: 25px;
      color: var(--text-sub);
    }

    ul,
    ol {
      margin-bottom: 25px;
      padding-left: 25px;
      color: var(--text-sub);

      li {
        margin-bottom: 10px;

        &::marker {
          color: var(--primary-color);
        }
      }
    }

    blockquote {
      border-left: 4px solid var(--primary-color);
      padding-left: 25px;
      font-style: italic;
      font-size: 1.4rem;
      margin: 40px 0;
      font-family: $font-main;
      color: var(--text-main);
      background: rgba(128, 128, 128, 0.05);
      padding: 20px 25px;
      border-radius: 0 8px 8px 0;
    }

    // 代码块样式
    pre {
      background: #2d2d2d;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
      overflow-x: auto;
      font-family: $font-mono;
      font-size: 0.9rem;
      line-height: 1.6;
      border: 1px solid var(--border-light);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

      code {
        background: transparent;
        padding: 0;
        color: #ccc;
      }
    }

    // 行内代码
    :not(pre)>code {
      background: rgba(128, 128, 128, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: $font-mono;
      font-size: 0.9em;
      color: var(--primary-color);
    }

    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 30px 0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    a {
      color: var(--primary-color);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.3s;

      &:hover {
        border-bottom-color: var(--primary-color);
      }
    }
  }
}

.article-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border-light);
  margin-bottom: 40px;
}
</style>
