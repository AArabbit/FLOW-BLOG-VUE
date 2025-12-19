<script setup lang="ts">
import { h, onMounted } from 'vue'
import { 
  NButton, NTag, NSpace, useMessage, NPopconfirm, NPagination, NDataTable, NTooltip 
} from 'naive-ui'
import { useVisitorStore } from '@/stores/visitor' 
// import { useThemeStore } from '@/stores/theme'

const visitorStore = useVisitorStore()
// const themeStore = useThemeStore()
const message = useMessage()

// 格式化时间函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', { hour12: false })
}

// 表格列定义
const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { 
    title: 'IP 地址', 
    key: 'ip', 
    width: 140,
    render(row: any) {
      // 点击复制 IP 功能（可选）
      return h(
        NTag, 
        { type: 'primary', bordered: false, style: { cursor: 'pointer' }, onClick: () => copyToClip(row.ip) }, 
        { default: () => row.ip }
      )
    }
  },
  { 
    title: '地理位置', 
    key: 'location',
    width: 180,
    render(row: any) {
      return row.location ? row.location : h('span', { style: 'color: #ccc' }, '未知')
    }
  },
  { 
    title: '访问次数', 
    key: 'count', 
    width: 100,
    sorter: (row1: any, row2: any) => row1.count - row2.count,
    render(row: any) {
      // 次数越多颜色越深
      const type = row.count > 100 ? 'error' : (row.count > 10 ? 'warning' : 'default')
      return h(NTag, { type, size: 'small' }, { default: () => `${row.count} 次` })
    }
  },
  {
    title: '设备信息 (User-Agent)',
    key: 'user_agent',
    ellipsis: {
      tooltip: true // Naive UI 自带的长文本省略+悬浮提示
    }
  },
  {
    title: '最后访问时间',
    key: 'updated_at',
    width: 180,
    render(row: any) {
      return formatDate(row.updated_at)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right' as const, // 修正类型推断
    render(row: any) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id)
      }, {
        trigger: () => h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => '删除' }),
        default: () => '确认删除该条访客记录吗？'
      })
    }
  }
]

// 复制
const copyToClip = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(`IP ${text} 已复制`)
  } catch (e) {
    message.error('复制失败')
  }
}

const handleDelete = async (id: number) => {
  await visitorStore.deleteVisitor(id)
  message.success('记录已删除')
 
  visitorStore.fetchVisitors(visitorStore.currentPage, 30)
}

const handlePageChange = (page: number) => {
  visitorStore.fetchVisitors(page, 30)
}

onMounted(() => {
  visitorStore.fetchVisitors(1, 30)
})
</script>

<template>
  <div class="view-container section-padding" style="padding-top: 120px;">
    <div class="header">
      <h1>访客统计</h1>
      <p class="subtitle">实时监控 IP 来源、地理位置及访问频率</p>
    </div>

    <!-- 表格区域 -->
    <n-data-table 
      :columns="columns" 
      :data="visitorStore.list" 
      :bordered="false" 
      :loading="visitorStore.isLoading" 
      :scroll-x="1000"
    />

    <!-- 分页区域 -->
    <div class="pagination-container">
      <n-pagination 
        v-model:page="visitorStore.currentPage" 
        :page-size="30" 
        :item-count="visitorStore.total"
        @update:page="handlePageChange" 
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  margin-bottom: 30px;

  h1 {
    color: var(--text-main);
  }

  .subtitle {
    color: var(--text-sub);
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>