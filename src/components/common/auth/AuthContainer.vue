<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { PhX } from "@phosphor-icons/vue";

const props = defineProps<{
  show: boolean
  title: string
  subtitle: string
}>()

const emit = defineEmits(['close'])

const modalRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

// 进场/离场动画控制
watch(() => props.show, (val) => {
  if (val) {
    nextTick(() => {
      // 背景淡入
      gsap.fromTo(overlayRef.value, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      // 卡片弹入
      gsap.fromTo(modalRef.value,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      )
    })
  }
})

const handleClose = () => {
  gsap.to(overlayRef.value, { opacity: 0, duration: 0.3 })
  gsap.to(modalRef.value, {
    y: 20, opacity: 0, scale: 0.95, duration: 0.3,
    onComplete: () => emit('close')
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" ref="overlayRef" class="login-overlay">
      <div class="backdrop" @click="handleClose"></div>

      <div ref="modalRef" class="login-card">
        <div class="card-header">
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>

        <slot></slot>

        <button class="close-icon" @click="handleClose"><PhX /></button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: z('modal');
  @include flex(center, center);
}

.backdrop {
  @include abs-cover;
  background: var(--mask-bg);
  backdrop-filter: blur(15px);
}

.login-card {
  position: relative;
  width: 90%;
  max-width: 440px;
  background: var(--card-bg);
  color: var(--text-main);
  padding: 40px;
  border-radius: 2px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.card-header {
  margin-bottom: 30px;
  text-align: center;

  h2 {
    font-size: 2rem;
    margin-bottom: 5px;
    font-weight: 700;
    color: var(--text-main);
    transition: color 0.3s;
  }

  p {
    color: var(--text-sub);
    font-size: 0.9rem;
    font-family: $font-main;
  }
}

.close-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-sub);
  transition: color 0.3s;

  &:hover {
    color: var(--text-main);
  }
}
</style>
