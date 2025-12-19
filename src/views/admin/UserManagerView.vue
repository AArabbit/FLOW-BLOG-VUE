<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import {  NButton, NModal, NForm, NFormItem, NInput, NSelect, NTag, NSpace, useMessage, NPopconfirm, NPagination, NDataTable } from 'naive-ui'
import { useAdminStore } from '@/stores/admin' // 替换 useAuthStore
import { useThemeStore } from '@/stores/theme'

const adminStore = useAdminStore()
const themeStore = useThemeStore()
const message = useMessage()

const showEditModal = ref(false)
const editFormModel = ref<any>({})

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '昵称', key: 'name' },
  { title: '邮箱', key: 'email' },
  {
    title: '角色',
    key: 'role',
    render(row: any) {
      return h(NTag, { type: row.role === 'admin' ? 'success' : 'default', bordered: false }, { default: () => row.role })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row: any) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, { size: 'small', secondary: true, onClick: () => openEdit(row) }, { default: () => '管理' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            trigger: () => h(NButton, { size: 'small', type: 'error', secondary: true, disabled: row.role === 'admin' }, { default: () => '删除' }),
            default: () => '确认删除该用户吗？'
          })
        ]
      })
    }
  }
]

const openEdit = (row: any) => {
  editFormModel.value = { ...row }
  showEditModal.value = true
}

const handleSave = () => {
  adminStore.updateUser(editFormModel.value)
  message.success('用户信息已更新')
  showEditModal.value = false
}

const handleDelete = (id: number) => {
  adminStore.deleteUser(id)
  message.success('用户已删除')
}

const handlePageChange = (page: number) => {
  adminStore.fetchUsers(page, 30)
}

onMounted(() => {
  if (adminStore.userList.length === 0) {
    adminStore.fetchUsers(1, 30)
  }
})
</script>

<template>
  <div class="view-container section-padding" style="padding-top: 120px;">
    <div class="header">
      <h1>用户管理</h1>
      <p class="subtitle">管理注册用户及其权限</p>
    </div>

    <n-data-table :columns="columns" :data="adminStore.userList" :bordered="false" :loading="adminStore.isLoading" />

    <div class="pagination-container">
      <n-pagination v-model:page="adminStore.currentPage" :page-size="30" :item-count="adminStore.total"
        @update:page="handlePageChange" />
    </div>

    <n-modal v-model:show="showEditModal">
      <div class="edit-card">
        <h3>编辑用户</h3>
        <n-form :model="editFormModel" label-placement="left" label-width="80">
          <n-form-item label="昵称">
            <n-input v-model:value="editFormModel.name" />
          </n-form-item>
          <n-form-item label="头像">
            <n-input v-model:value="editFormModel.avatar" placeholder="输入头像 URL" />
          </n-form-item>
          <n-form-item label="邮箱">
            <n-input v-model:value="editFormModel.email" />
          </n-form-item>
          <n-form-item label="权限">
            <n-select v-model:value="editFormModel.role"
              :options="[{ label: '管理员', value: 'admin' }, { label: '普通用户', value: 'user' }]" />
          </n-form-item>
          <div class="footer">
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button type="primary" :color="themeStore.themeColor" @click="handleSave">保存修改</n-button>
          </div>
        </n-form>
      </div>
    </n-modal>
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

.edit-card {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 4px;
  width: 400px;

  h3 {
    margin-bottom: 20px;
    color: var(--text-main);
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
}
</style>
