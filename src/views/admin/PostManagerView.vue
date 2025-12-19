<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NPagination } from 'naive-ui'
import { usePostStore } from '@/stores/posts'
import PostList from '@/components/admin/post/PostList.vue'
import PostEditor from '@/components/admin/post/PostEditor.vue'

const postStore = usePostStore()
const message = useMessage()

// 视图模式：'list' | 'editor'
const viewMode = ref('list')
const currentPost = ref<any>({})

// Actions
const createNewPost = () => {
  currentPost.value = { title: '', desc: '', cover: '' }
  viewMode.value = 'editor'
}

const editPost = (row: any) => {
  currentPost.value = { ...row }
  viewMode.value = 'editor'
}

const handleDelete = (id: number) => {
  postStore.deletePost(id)
  message.success('文章已删除')
}

const handleSave = async (postData: any) => {
  try {
    await postStore.savePost(postData)
    message.success('保存成功')
    viewMode.value = 'list'
  } catch (error) {
    message.error('保存失败')
  }
}
const handleToggleCurated = async (post: any, value: boolean) => {
  try {
    // 调用 savePost 更新 is_curated 状态
    await postStore.savePost({
      ...post,
      is_curated: value
    })
    message.success(value ? '已设为精选' : '已取消精选')
  } catch (error) {
    message.error('操作失败')
  }
}

const handlePageChange = (page: number) => {
  postStore.fetchAdminPosts(page, 50)
}

onMounted(() => {
  postStore.fetchAdminPosts(1, 50)
})
</script>

<template>
  <div class="view-container section-padding" style="padding-top: 120px;">
    <transition name="fade" mode="out-in">
      <div v-if="viewMode === 'list'">
        <PostList :posts="postStore.adminPosts" @create="createNewPost" @edit="editPost" @delete="handleDelete"
          @toggle-curated="handleToggleCurated" />
        <div class="pagination-container">
          <n-pagination v-model:page="postStore.adminPage" :page-size="50" :item-count="postStore.adminTotal"
            @update:page="handlePageChange" />
        </div>
      </div>

      <PostEditor v-else :post="currentPost" :categories="postStore.categories" @save="handleSave"
        @cancel="viewMode = 'list'" />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
