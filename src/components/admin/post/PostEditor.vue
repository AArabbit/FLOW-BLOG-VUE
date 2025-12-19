<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { usePostStore } from '@/stores/posts'
import type { Category } from '@/types'
import { useMessage, NInput, NSelect, NButton, NModal, NSkeleton } from 'naive-ui'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps<{
  post: any
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', post: any): void
  (e: 'cancel'): void
}>()

const themeStore = useThemeStore()
const postStore = usePostStore()
const message = useMessage()

// 加载状态
const isEditorReady = ref(false)

const currentPost = ref<any>({ ...props.post })
const editorContent = ref(props.post.content || '')
const editorDesc = ref(props.post.desc || '')
const selectedCategory = ref<number | null>(props.post.category?.id || null)
const showDraftModal = ref(false)
const isLoadingDraft = ref(false)
const vditorRef = ref<Vditor | null>(null)

const categoryOptions = computed(() => props.categories.map(c => ({ label: c.name, value: c.id })))

// 生成草稿内容
function generateDraftContent(): string {
  return JSON.stringify({
    title: currentPost.value.title,
    desc: editorDesc.value,
    content: editorContent.value,
    category_id: selectedCategory.value
  })
}

// 解析草稿内容
function parseDraftContent(draftStr: string): any {
  try {
    return JSON.parse(draftStr)
  } catch {
    return null
  }
}

const handleSave = async () => {
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

// 保存草稿
const handleSaveDraft = async () => {
  const draftContent = generateDraftContent()
  const success = await postStore.saveDraftContent(draftContent)
  if (success) {
    message.success('草稿已保存，下次进入时可恢复')
  }
}

// 加载草稿
const handleLoadDraft = async () => {
  isLoadingDraft.value = true
  try {
    const draft = await postStore.loadDraft()
    if (draft) {
      const parsed = parseDraftContent(draft)
      if (parsed) {
        currentPost.value.title = parsed.title || ''
        editorDesc.value = parsed.desc || ''
        editorContent.value = parsed.content || ''
        selectedCategory.value = parsed.category_id || null

        if (vditorRef.value) {
          vditorRef.value.setValue(editorContent.value)
        }

        message.success('草稿已加载')
        showDraftModal.value = false
        // 清除草稿标记
        postStore.clearDraftMark()
      } else {
        message.error('草稿数据格式错误')
      }
    } else {
      message.error('草稿已过期或不存在')
      postStore.clearDraftMark()
    }
  } finally {
    isLoadingDraft.value = false
  }
}

const initVditor = () => {
  const isDark = document.documentElement.classList.contains('dark') || themeStore.isDark

  vditorRef.value = new Vditor('vditor', {
    height: '100%',
    mode: 'ir', // 即时渲染模式
    placeholder: '开始写作...',
    theme: isDark ? 'dark' : 'classic',
    cache: {
      enable: false
    },
    value: editorContent.value,
    input: (val) => {
      editorContent.value = val
    },
    after: () => {
      isEditorReady.value = true
      const content = vditorRef.value?.vditor.element.querySelector('.vditor-content')
      if (content) {
        content.classList.add('markdown-body')
      }
    }
  })
}

onMounted(async () => {
  initVditor()

  // 检查草稿
  if (!props.post.id && postStore.hasDraftAvailable()) {
    showDraftModal.value = true
  }
})

// 清理资源
onUnmounted(() => {
  if (vditorRef.value) {
    vditorRef.value.destroy()
    vditorRef.value = null
  }
  showDraftModal.value = false
})
</script>

<template>
  <div class="manager-editor">
    <!-- 草稿加载弹窗 -->
    <n-modal v-model:show="showDraftModal" title="发现草稿" type="info" preset="dialog" positive-text="加载草稿"
      negative-text="放弃" :loading="isLoadingDraft" @positive-click="handleLoadDraft"
      @negative-click="showDraftModal = false">
      <p>检测到您有未完成的草稿，是否加载上次保存的内容继续编辑？</p>
      <p style="color: var(--text-sub); font-size: 12px; margin-top: 8px;">
        （草稿有效期：48小时）
      </p>
    </n-modal>

    <div class="editor-header">
      <div class="header-top">
        <n-input v-model:value="currentPost.title" placeholder="请输入文章标题" class="title-input" size="large" />
        <div class="actions">
          <n-select v-model:value="selectedCategory" :options="categoryOptions" placeholder="选择分类"
            style="width: 140px" />
          <n-button secondary @click="handleSaveDraft" title="保存为草稿（48小时有效）">
            保存草稿
          </n-button>
          <n-button secondary @click="emit('cancel')">取消</n-button>
          <n-button type="primary" :color="themeStore.themeColor" @click="handleSave">发布</n-button>
        </div>
      </div>
      <n-input v-model:value="editorDesc" type="textarea" placeholder="请输入文章摘要..." :rows="2" class="desc-input" />
    </div>

    <div class="vditor-wrapper">
      <div id="vditor"></div>

      <!-- 加载占位 -->
      <div v-if="!isEditorReady" class="editor-loading">
        <n-skeleton text style="width: 50%; height: 30px; margin-bottom: 20px" />
        <n-skeleton text :repeat="10" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.manager-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: var(--card-bg);
  z-index: 10;
}

.editor-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-shrink: 0;

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

.vditor-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;

  #vditor {
    height: 100%;
    border: none;
  }

  :deep(.vditor) {
    border: none;
    --vditor-content-font-size: 16px;
  }

  :deep(.vditor-toolbar) {
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-light);
  }

  :deep(.vditor-content) {
    background: var(--card-bg);
    display: flex;
    justify-content: center;

    .vditor-ir {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 20px 40px !important;
    }
  }
}
</style>