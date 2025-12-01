<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { NConfigProvider, NGlobalStyle, NBackTop, darkTheme, NMessageProvider } from 'naive-ui'
import Lenis from '@studio-freight/lenis'
import { useThemeStore } from '@/stores/theme'

// 组件引入
import Navbar from '@/components/layout/Navbar.vue'
import SettingsDrawer from '@/components/common/SettingsDrawer.vue'
import SearchOverlay from '@/components/common/SearchOverlay.vue'
import LoginModal from '@/components/common/LoginModal.vue'
import BackToTop from '@/components/common/BackToTop.vue'

const themeStore = useThemeStore()

// 初始化平滑滚动
onMounted(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
})

const themeOverrides = computed(() => ({
  common: {
    primaryColor: themeStore.themeColor,
    primaryColorHover: themeStore.themeColor,
    primaryColorPressed: themeStore.themeColor,
    bodyColor: themeStore.isDark ? '#121212' : '#f7f7f5',
    cardColor: themeStore.isDark ? '#1e1e1e' : '#ffffff',
  },
  Button: {
    borderRadiusMedium: '0px',
  }
}))

const naiveTheme = computed(() => themeStore.isDark ? darkTheme : null)
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider>
      <div class="app-wrapper">
        <Navbar />

        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="themeStore.cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>

        <footer class="main-footer">
          <div class="footer-content">
            <h2>Let's create together.</h2>
            <p>© 2025 Mind Flow Blog.</p>
          </div>
        </footer>

        <SearchOverlay />
        <LoginModal />
        <SettingsDrawer />
        <BackToTop />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped>
.main-footer {
  padding: 120px 5vw;
  background: #000;
  color: white;
  text-align: center;
  margin-top: auto;
  transition: background-color 0.3s;

  h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-family: 'Space Grotesk';
  }
}

:global(html.dark) .main-footer {
  background: #050505;
}
</style>
