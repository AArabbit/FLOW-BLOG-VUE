<template>
  <div
    class="award-card"
    ref="cardRef"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="card-inner">
      <!-- 顶部 -->
      <div class="card-header">
        <span class="index-num" ref="numRef">{{ formattedIndex }}</span>
      </div>

      <!-- 中部 -->
      <div class="card-body" @click.stop="onTitleClick">
        <div class="category-text" ref="catRef">{{ item.category }}</div>
        <h3 class="card-title" ref="titleRef">{{ item.title }}</h3>
      </div>

      <!-- 底部 -->
      <div class="card-footer" ref="footerRef">
        <div class="glow-indicator">
          <span class="indicator-text">查看</span>
          <div class="indicator-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue";
import gsap from "gsap";
import type { DocItem } from "@/api/docs";

const props = defineProps({
  item: {
    type: Object as () => DocItem & { _virtualIndex?: number },
    required: true,
  },
  isActive: { type: Boolean, default: false },
});

const emit = defineEmits<{
  (e: "card-click", item: DocItem): void;
}>();

const formattedIndex = computed(() => {
  const idx = (props.item._virtualIndex || 0) + 1;
  return idx < 10 ? `0${idx}` : `${idx}`;
});

const onTitleClick = () => {
  emit("card-click", props.item as DocItem);
};

// GSAP
const cardRef = ref(null);
const numRef = ref(null);
const catRef = ref(null);
const titleRef = ref(null);
const footerRef = ref(null);

let tl: gsap.core.Timeline | null = null;

const initTimeline = () => {
  tl = gsap.timeline({ paused: true });

  // 激活时
  tl.to(
    cardRef.value,
    {
      backgroundColor: "#1a1a1a",
      scale: 1.05,
      opacity: 1,
      // 模拟背光效果
      boxShadow:
        "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      duration: 0.5,
      ease: "power3.out",
    },
    0
  );

  // 序号：变小并变亮
  tl.to(
    numRef.value,
    {
      opacity: 0.3,
      scale: 0.8,
      x: -10,
      duration: 0.5,
    },
    0
  );

  // 分类文字：上浮显示
  tl.to(
    catRef.value,
    {
      opacity: 0.7,
      y: 0,
      duration: 0.4,
    },
    0.1
  );

  // 标题：高亮，轻微放大
  tl.to(
    titleRef.value,
    {
      color: "#ffffff",
      scale: 1.05,
      y: -5,
      duration: 0.5,
      ease: "back.out(1.2)",
    },
    0.1
  );

  // 底部：上浮显示
  tl.to(
    footerRef.value,
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    },
    0.2
  );
};

onMounted(() => {
  initTimeline();
  if (props.isActive) tl?.play();
  else setInactiveState();
});

watch(
  () => props.isActive,
  (newVal) => {
    if (newVal) tl?.play();
    else tl?.reverse();
  }
);

const setInactiveState = () => {
  // 默认状态：无边框，无阴影
  gsap.set(cardRef.value, {
    scale: 0.92,
    opacity: 0.5,
    backgroundColor: "rgba(255,255,255,0.02)",
    boxShadow: "none",
    border: "1px solid transparent",
  });
  gsap.set(catRef.value, { opacity: 0, y: 10 });
  gsap.set(footerRef.value, { opacity: 0, y: 10 });
  gsap.set(titleRef.value, { color: "var(--text-sub)" }); // 默认灰色
};

// hover
const onMouseEnter = () => {
  if (!props.isActive) return;
  gsap.to(titleRef.value, {
    scale: 1.15,
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
  gsap.to(footerRef.value, {
    scale: 1.15,
    x: -8,
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
};

const onMouseLeave = () => {
  if (!props.isActive) return;
  gsap.to(titleRef.value, {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
  gsap.to(footerRef.value, {
    scale: 1,
    x: 0,
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;800&display=swap");

.award-card {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  will-change: transform, box-shadow, background-color;
}

.card-inner {
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 序号 */
.index-num {
  font-family: "Manrope", sans-serif;
  font-size: 4rem;
  font-weight: 800;
  color: var(--text-sub);
  opacity: 0.1;
  /* 默认不可见 */
  line-height: 1;
  display: block;
}

/* 中部内容 */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-text {
  font-family: "Manrope", sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text-sub);
  margin-bottom: 12px;
  font-weight: 500;
}

.card-title {
  font-family: "Manrope", sans-serif;
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1.1;
  margin: 0;
  color: var(--text-sub);
  /* 默认暗淡 */

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部光点 */
.card-footer {
  display: flex;
  justify-content: flex-end;
}

.glow-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.indicator-text {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  opacity: 0.8;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 0 10px #fff;
  /* 发光的小点 */
}
</style>
