<script setup lang="ts">
import { NDrawer, NDrawerContent, NColorPicker, NSpace, NSwitch, NDivider } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui' // 引入 UI Store

const themeStore = useThemeStore()
const uiStore = useUIStore()
</script>

<template>
  <n-drawer v-model:show="uiStore.settingsOpen" width="300" placement="right" :block-scroll="false"
    :on-update:show="(val) => uiStore.toggleSettings(val)">
    <n-drawer-content title="界面设置">
      <n-space vertical size="large">

        <div class="setting-item">
          <div class="setting-label">
            <h4>外观模式</h4>
            <span class="desc">切换明亮/暗黑主题</span>
          </div>
          <n-switch :value="themeStore.isDark" @update:value="themeStore.toggleDarkMode" size="large">
            <template #checked-icon><i class="ph ph-moon"></i></template>
            <template #unchecked-icon><i class="ph ph-sun"></i></template>
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

      <div class="drawer-footer">
        <p>MIND FLOW v1.0</p>
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
