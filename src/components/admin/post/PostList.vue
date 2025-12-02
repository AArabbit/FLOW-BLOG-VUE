<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NButton, NSpace, NTag } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import type { Post } from '@/types'

const props = defineProps<{
  posts: Post[]
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', post: Post): void
  (e: 'delete', id: number): void
}>()

const themeStore = useThemeStore()

const columns = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  {
    title: '分类',
    key: 'category.name',
    width: 100,
    render: (row: any) => h(NTag, { bordered: false }, { default: () => row.category.name })
  },
  { title: '日期', key: 'date', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: any) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            secondary: true,
            onClick: () => emit('edit', row)
          }, { default: () => '编辑' }),
          h(NButton, {
            size: 'small',
            type: 'error',
            secondary: true,
            onClick: () => emit('delete', row.id)
          }, { default: () => '删除' })
        ]
      })
    }
  }
]
</script>

<template>
  <div class="manager-list">
    <div class="header">
      <h1>文章管理</h1>
      <n-button type="primary" :color="themeStore.themeColor" @click="emit('create')">
        发布新文章
      </n-button>
    </div>
    <n-data-table :columns="columns" :data="posts" :bordered="false" />
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
</style>
