<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
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

const handleSave = (postData: any) => {
  postStore.savePost(postData)
  message.success('保存成功')
  viewMode.value = 'list'
}
</script>

<template>
  <div class="view-container section-padding" style="padding-top: 120px;">
    <transition name="fade" mode="out-in">
      <PostList v-if="viewMode === 'list'" :posts="postStore.posts" @create="createNewPost" @edit="editPost"
        @delete="handleDelete" />

      <PostEditor v-else :post="currentPost" :categories="postStore.categories" @save="handleSave"
        @cancel="viewMode = 'list'" />
    </transition>
  </div>
</template>

<style lang="scss" scoped></style>
