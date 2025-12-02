<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NInput, NSelect, useMessage } from 'naive-ui'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import { useThemeStore } from '@/stores/theme'
import type { Category } from '@/types'

const props = defineProps<{
  post: any
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', post: any): void
  (e: 'cancel'): void
}>()

const themeStore = useThemeStore()
const message = useMessage()


const currentPost = ref<any>({ ...props.post })
const editorContent = ref(props.post.content || '')
const editorDesc = ref(props.post.desc || '')
const selectedCategory = ref<number | null>(props.post.category?.id || null)

const categoryOptions = computed(() => props.categories.map(c => ({ label: c.name, value: c.id })))

// Markdown
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return '<pre class="language-' + lang + '"><code>' +
          Prism.highlight(str, Prism.languages[lang], lang) +
          '</code></pre>';
      } catch (__) { }
    }
    return '<pre class="language-text"><code>' + escapeHtml(str) + '</code></pre>';
  }
})

const parsedContent = computed(() => md.render(editorContent.value))


const handleSave = () => {
  if (!currentPost.value.title || !editorContent.value) {
    message.error('请填写标题和内容')
    return
  }

  const category = props.categories.find(c => c.id === selectedCategory.value) || props.categories[0]

  const postData = {
    ...currentPost.value,
    desc: editorDesc.value || editorContent.value.slice(0, 100) + '...',
    content: editorContent.value,
    category
  }

  emit('save', postData)
}
</script>

<template>
  <div class="manager-editor">
    <div class="editor-header">
      <div class="header-top">
        <n-input v-model:value="currentPost.title" placeholder="请输入文章标题" class="title-input" size="large" />
        <div class="actions">
          <n-select v-model:value="selectedCategory" :options="categoryOptions" placeholder="选择分类"
            style="width: 140px" />
          <n-button secondary @click="emit('cancel')">取消</n-button>
          <n-button type="primary" :color="themeStore.themeColor" @click="handleSave">发布</n-button>
        </div>
      </div>
      <n-input v-model:value="editorDesc" type="textarea" placeholder="请输入文章摘要 (用于列表展示)..." :rows="2"
        class="desc-input" />
    </div>

    <div class="markdown-wrapper">
      <div class="editor-pane">
        <div class="pane-label">编辑</div>
        <textarea v-model="editorContent" class="md-input" placeholder="开始写作 (Markdown)..."
          data-lenis-prevent></textarea>
      </div>
      <div class="preview-pane">
        <div class="pane-label">预览</div>
        <div class="md-preview article-body" v-html="parsedContent" data-lenis-prevent></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.editor-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .header-top {
    display: flex;
    gap: 20px;
  }

  .title-input {
    flex: 1;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 10px;
  }
}

.markdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 250px);

  .editor-pane,
  .preview-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    background: var(--card-bg);
    overflow: hidden;
    min-height: 0;
  }

  .pane-label {
    padding: 8px 15px;
    background: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid var(--border-light);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-sub);
    text-transform: uppercase;
  }

  .md-input {
    flex: 1;
    width: 100%;
    padding: 20px;
    border: none;
    background: transparent;
    color: var(--text-main);
    resize: none;
    font-family: 'Courier New', monospace;
    outline: none;
    line-height: 1.6;
    font-size: 1rem;
  }

  .md-preview {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: var(--bg-color);
  }
}

// 复用 ArticleContent 的 Markdown 样式
:deep(.article-body) {

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--text-main);
    font-weight: 700;
    margin: 30px 0 15px;
    line-height: 1.3;
  }

  h2 {
    font-size: 1.8rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.2rem;
  }

  p {
    margin-bottom: 15px;
    color: var(--text-sub);
    line-height: 1.8;
  }

  ul,
  ol {
    margin-bottom: 15px;
    padding-left: 25px;
    color: var(--text-sub);

    li {
      margin-bottom: 5px;

      &::marker {
        color: var(--primary-color);
      }
    }
  }

  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 15px;
    font-style: italic;
    font-size: 1.1rem;
    margin: 20px 0;
    font-family: $font-main;
    color: var(--text-main);
    background: rgba(128, 128, 128, 0.05);
    padding: 15px 20px;
    border-radius: 0 4px 4px 0;
  }

  pre {
    background: #2d2d2d;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
    overflow-x: auto;
    font-family: $font-mono;
    font-size: 0.9rem;
    line-height: 1.5;
    border: 1px solid var(--border-light);

    code {
      background: transparent;
      padding: 0;
      color: #ccc;
    }
  }

  :not(pre)>code {
    background: rgba(128, 128, 128, 0.15);
    padding: 2px 5px;
    border-radius: 3px;
    font-family: $font-mono;
    font-size: 0.9em;
    color: var(--primary-color);
  }

  img {
    max-width: 100%;
    border-radius: 4px;
    margin: 20px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
</style>
