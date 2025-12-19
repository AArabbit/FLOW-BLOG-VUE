<script setup lang="ts">
import { onMounted, computed, ref, onBeforeUnmount, provide } from "vue";
import {
  darkTheme,
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
} from "naive-ui";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useThemeStore } from "@/stores/theme";

// 组件引入
import Navbar from "@/components/layout/Navbar.vue";
import Footer from "@/components/layout/Footer.vue";
import SettingsDrawer from "@/components/common/SettingsDrawer.vue";
import SearchOverlay from "@/components/common/SearchOverlay.vue";
import LoginModal from "@/components/common/LoginModal.vue";
import BackToTop from "@/components/common/BackToTop.vue";
import ArticleModal from "@/views/ArticleModal.vue";
import { useArticleModalStore } from "@/stores/articleModal";
import { visitor } from "@/api/visitor";

const themeStore = useThemeStore();
const articleModalStore = useArticleModalStore();
const lenisRef = ref<Lenis | null>(null);
const isCallbackProcessing = ref(false);

const recordVisit = async () => {
  const STORAGE_KEY = "is_visited";

  if (sessionStorage.getItem(STORAGE_KEY)) {
    return;
  }
  // 立即加锁，防止重复调用
  sessionStorage.setItem(STORAGE_KEY, "true");

  try {
    await visitor();
  } catch (error) {
    console.error("记录访问失败", error);
    // 请求失败解锁，下次刷新再次记录
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

// 第三方参数处理
function processParams() {
  // 获取 URL 参数
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  // 判断是否为GitHub回调且处于弹窗中
  if (code && state && window.opener) {
    isCallbackProcessing.value = true; // 标记为处理中

    // 向父窗口（主应用）发送消息
    window.opener.postMessage(
      {
        type: "GITHUB_AUTH_CODE",
        code,
        state,
      },
      window.location.origin
    ); // 限制只有同源窗口能接收

    // 关闭当前弹窗
    window.close();
  }
}

// 初始化平滑滚动
onMounted(async () => {
  recordVisit();
  processParams()

  const lenis = new Lenis({
    autoRaf: true, // 自动处理 requestAnimationFrame
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenisRef.value = lenis;
});

const themeOverrides = computed(() => ({
  common: {
    primaryColor: themeStore.themeColor,
    primaryColorHover: themeStore.themeColor,
    primaryColorPressed: themeStore.themeColor,
    bodyColor: themeStore.isDark ? "#121212" : "#f7f7f5",
    cardColor: themeStore.isDark ? "#1e1e1e" : "#ffffff",
  },
  Button: {
    borderRadiusMedium: "0px",
  },
}));

const naiveTheme = computed(() => (themeStore.isDark ? darkTheme : null));
onBeforeUnmount(() => {
  lenisRef.value?.destroy();
});

// 向下提供全局Lenis实例
provide("globalLenis", lenisRef);
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider>
      <div
        v-if="isCallbackProcessing"
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        "
      >
        正在验证 GitHub 登录...
      </div>

      <div v-else class="app-wrapper">
        <Navbar />

        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="themeStore.cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>

        <SearchOverlay />
        <LoginModal />
        <SettingsDrawer />
        <BackToTop />
        <ArticleModal
          v-model="articleModalStore.isVisible"
          :post-id="articleModalStore.currentPostId"
        />
        <Footer />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped></style>
