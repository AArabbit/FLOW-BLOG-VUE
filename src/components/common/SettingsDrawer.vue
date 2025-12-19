<script setup lang="ts">
import { ref } from 'vue'
import { NDrawer, NDrawerContent, NColorPicker, NSpace, NSwitch, NDivider, NTabs, NTabPane } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'
import { PhMoon, PhSun } from "@phosphor-icons/vue";

const themeStore = useThemeStore()
const uiStore = useUIStore()

const activeTab = ref<'appearance' | 'security'>('appearance')
</script>

<template>
  <n-drawer v-model:show="uiStore.settingsOpen" width="350" placement="right" :block-scroll="false"
    :on-update:show="(val) => uiStore.toggleSettings(val)">
    <n-drawer-content title="设置">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="appearance" tab="外观">
          <n-space vertical size="large">
            <div class="setting-item">
              <div class="setting-label">
                <h4>外观模式</h4>
                <span class="desc">切换明亮/暗黑主题</span>
              </div>
              <n-switch :value="themeStore.isDark" @update:value="themeStore.toggleDarkMode" size="large">
                <template #checked-icon><PhMoon/></template>
                <template #unchecked-icon><PhSun/></template>
              </n-switch>
            </div>

            <n-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>主题色风格</h4>
                <span class="desc">定义品牌主色调</span>
              </div>
              <n-color-picker :value="themeStore.themeColor" @update:value="themeStore.setThemeColor" :show-alpha="false"
                :swatches="['#2a2a2a', '#e63946', '#457b9d', '#2a9d8f', '#d00000', '#7b2cbf']" />
            </div>
          </n-space>
        </n-tab-pane>
      </n-tabs>

      <div class="drawer-footer">
        <p>FLOW BLOG</p>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_variables.scss" as *;

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .setting-label {
    h4 {
      margin: 0;
      font-size: 1rem;
      color: var(--text-main);
    }

    .desc {
      font-size: 0.8rem;
      color: var(--text-sub);
    }
  }
}

.drawer-footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  color: var(--text-sub);
  font-size: 0.75rem;
  font-family: $font-main;
}
</style>
