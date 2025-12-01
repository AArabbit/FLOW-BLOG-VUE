<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NInput, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import { marked } from 'marked' // markdown
import { usePostStore } from '@/stores/posts'
import { useThemeStore } from '@/stores/theme'

const postStore = usePostStore()
const themeStore = useThemeStore()
const message = useMessage()

// 视图模式：'list' | 'editor'
const viewMode = ref('list')
const currentPost = ref<any>({})

// 表格配置
const columns = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '分类', key: 'category.name', width: 100, render: (row: any) => h(NTag, { bordered: false }, { default: () => row.category.name }) },
  { title: '日期', key: 'date', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: any) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, { size: 'small', secondary: true, onClick: () => editPost(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: 'error', secondary: true, onClick: () => handleDelete(row.id) }, { default: () => '删除' })
        ]
      })
    }
  }
]

// 编辑器相关
const editorContent = ref('')
const parsedContent = computed(() => marked(editorContent.value))
const categoryOptions = computed(() => postStore.categories.map(c => ({ label: c.name, value: c.id })))
const selectedCategory = ref<number | null>(null)

// Actions
const createNewPost = () => {
  currentPost.value = { title: '', desc: '', cover: '' }
  editorContent.value = ''
  selectedCategory.value = null
  viewMode.value = 'editor'
}

const editPost = (row: any) => {
  currentPost.value = { ...row }
  // 模拟把 desc 当作正文
  editorContent.value = row.desc
  selectedCategory.value = row.category.id
  viewMode.value = 'editor'
}

const handleDelete = (id: number) => {
  postStore.deletePost(id)
  message.success('文章已删除')
}

const handleSave = () => {
  if (!currentPost.value.title || !editorContent.value) {
    message.error('请填写标题和内容')
    return
  }

  const category = postStore.categories.find(c => c.id === selectedCategory.value) || postStore.categories[0]

  postStore.savePost({
    ...currentPost.value,
    desc: editorContent.value, // 简化：直接存到 desc
    category
  })

  message.success('保存成功')
  viewMode.value = 'list'
}
</script>

<template>
  <div class="view-container section-padding" style="padding-top: 120px;">

    <div v-if="viewMode === 'list'" class="manager-list">
      <div class="header">
        <h1>文章管理</h1>
        <n-button type="primary" :color="themeStore.themeColor" @click="createNewPost">
          发布新文章
        </n-button>
      </div>
      <n-data-table :columns="columns" :data="postStore.posts" :bordered="false" />
    </div>

    <div v-else class="manager-editor">
      <div class="editor-header">
        <n-input v-model:value="currentPost.title" placeholder="请输入文章标题" class="title-input" />
        <div class="actions">
          <n-select v-model:value="selectedCategory" :options="categoryOptions" placeholder="选择分类"
            style="width: 140px" />
          <n-button secondary @click="viewMode = 'list'">取消</n-button>
          <n-button type="primary" :color="themeStore.themeColor" @click="handleSave">发布</n-button>
        </div>
      </div>

      <div class="markdown-wrapper">
        <textarea v-model="editorContent" class="md-input" placeholder="开始写作 (Markdown)..."></textarea>
        <div class="md-preview typo" v-html="parsedContent"></div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    font-size: 2rem;
    color: var(--text-main);
  }
}

.editor-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .title-input {
    flex: 1;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 10px;
  }
}

.markdown-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 70vh;

  .md-input {
    width: 100%;
    height: 100%;
    padding: 20px;
    border: 1px solid var(--border-light);
    background: var(--card-bg);
    color: var(--text-main);
    resize: none;
    font-family: 'Courier New', monospace;
    outline: none;
    border-radius: 4px;
    line-height: 1.6;
    font-size: 1rem;
  }

  .md-preview {
    padding: 20px;
    border: 1px solid var(--border-light);
    background: var(--bg-color);
    color: var(--text-main);
    overflow-y: auto;
    border-radius: 4px;

    // 简单的 Markdown 样式重置
    :deep(h1),
    :deep(h2) {
      margin-bottom: 0.5em;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.3em;
    }

    :deep(p) {
      margin-bottom: 1em;
      line-height: 1.8;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: 4px;
    }
  }
}

@media (max-width: 768px) {
  .markdown-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
