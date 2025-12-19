<script setup lang="ts">
import { ref, onMounted, inject, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePostStore } from '@/stores/posts'
import type { Post } from '@/types'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import ArticleDetail from '@/components/article/ArticleDetail.vue'

const route = useRoute()
const postStore = usePostStore()
const post = ref<Post | undefined>(undefined)
const isLoading = ref(true)

const articleDetailRef = ref<any>(null)

onMounted(async () => {
  window.scrollTo(0, 0)

  const id = Number(route.params.id)

  try {
    post.value = await postStore.fetchPostDetail(id)
  } finally {
    isLoading.value = false

    // 数据加载后，执行进场动画
    await nextTick()
    if (articleDetailRef.value) {
      articleDetailRef.value.initAnimations()
      articleDetailRef.value.initTOC()
    }
  }
})
</script>

<template>
  <div class="view-container">

    <div v-if="isLoading" class="skeleton-container">
      <SkeletonCard />
    </div>

    <div v-else-if="post">
      <ArticleDetail ref="articleDetailRef" :post="post" />
    </div>

  </div>
</template>

<style lang="scss" scoped>
.view-container {
  min-height: 100vh;
}

.skeleton-container {
  padding-top: 100px;
  max-width: 1200px;
  margin: 0 auto;
}

</style>
