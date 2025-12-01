<script setup lang="ts">
// import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { useRoute } from 'vue-router'

// 代码高亮相关
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'

const props = defineProps<{
  post: any
}>()

const router = useRouter()
const themeStore = useThemeStore()

const highlighter = (code: string) => {
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
}

// 返回逻辑
const handleBack = () => {
  // 如果历史记录中有上一页，且不是从外部直接打开的
  if (window.history.length > 1) {
    router.back() // 触发浏览器后退，配合 KeepAlive 恢复位置
  } else {
    router.push('/') // 只有在没有历史记录时才去首页
  }
}
</script>

<template>
  <article class="article-main">
    <p class="lead">{{ post.desc }}</p>
    <div class="divider"></div>

    <div class="article-body">
      <h3>第一章节：起源与思考</h3>
      <p>在这个章节中，我们深入探讨技术的本质。随着 Vue 3.0 的发布，组合式 API 带来了逻辑复用的新范式。</p>

      <div v-if="post.codeSnippet" class="code-showcase">
        <div class="code-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="lang-badge">TypeScript</span>
        </div>
        <prism-editor class="my-editor" v-model="post.codeSnippet" :highlight="highlighter" readonly
          line-numbers></prism-editor>
      </div>

      <h3>第二章节：构建现代化体验</h3>
      <p>设计不仅仅是视觉的堆砌。Awwwards 风格强调的是一种流动的体验（Flow）。</p>

      <blockquote>
        "好的设计是显而易见的，伟大的设计是透明的。"
      </blockquote>

      <h3>第三章节：未来的展望</h3>
      <p>这不仅是一个博客，更是一个技术游乐场。</p>
    </div>

    <div class="article-footer">
      <n-button 
        secondary 
        size="large" 
        @click="handleBack"
        :style="{ '--n-text-color': themeStore.themeColor }"
      >
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

  :deep(h3) {
    font-size: 1.8rem;
    margin: 50px 0 25px;
    font-weight: 700;
    color: var(--text-main);
    scroll-margin-top: 100px;
  }

  :deep(p) {
    margin-bottom: 25px;
    color: var(--text-sub);
  }

  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding-left: 25px;
    font-style: italic;
    font-size: 1.4rem;
    margin: 40px 0;
    font-family: $font-main;
    color: var(--text-main);
  }
}

// 代码编辑器样式
.code-showcase {
  margin: 40px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-light);
  background: #2d2d2d;

  .code-header {
    background: #1e1e1e;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #333;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;

      &.red {
        background: #ff5f56;
      }

      &.yellow {
        background: #ffbd2e;
      }

      &.green {
        background: #27c93f;
      }
    }

    .lang-badge {
      margin-left: auto;
      font-size: 0.75rem;
      color: #888;
      font-family: $font-mono;
      text-transform: uppercase;
    }
  }

  .my-editor {
    background: #2d2d2d;
    color: #ccc;
    font-family: $font-mono;
    font-size: 0.9rem;
    line-height: 1.6;
    padding: 20px 10px;

    :deep(.prism-editor__textarea:focus) {
      outline: none;
    }

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
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
