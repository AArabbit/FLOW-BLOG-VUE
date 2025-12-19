<template>
  <div
    class="wheel-root"
    ref="container"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
  >
    <CustomCursor
      ref="cursorRef"
      :is-hovering="isHovering"
      :is-dragging="isDragging"
    />

    <div class="wheel-stage" :style="wheelStyle">
      <div
        v-for="(item, index) in perfectCircleItems"
        :key="index"
        class="card-wrapper"
        :style="getCardStyle(index)"
      >
        <div class="card-inner-anim">
          <AwardCard
            :item="item"
            :is-active="isCardActive(index)"
            @card-click="handleCardClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import gsap from "gsap";
import type { DocItem } from "@/api/docs";
import AwardCard from "@/components/common/AwardCard.vue";
import CustomCursor from "@/components/common/CustomCursor.vue";

const container = ref<HTMLElement | null>(null);

const props = defineProps({
  items: { type: Array as () => DocItem[], default: () => [] },
  radius: { type: Number, default: 1800 },
  cardWidth: { type: Number, default: 360 },
  cardHeight: { type: Number, default: 520 },
  angleStep: { type: Number, default: 14 },
});

const circleConfig = computed(() => {
  const count = Math.round(360 / props.angleStep);
  const realStep = 360 / count;
  return { count, realStep };
});

const perfectCircleItems = computed(() => {
  if (!props.items || props.items.length === 0) return [];
  const { count } = circleConfig.value;
  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    const originalItem = (props.items as DocItem[])[
      i % (props.items as DocItem[]).length
    ];
    result.push({ ...originalItem, _virtualIndex: i });
  }
  return result;
});

const isDragging = ref<boolean>(false);
const startX = ref<number>(0);
const startRotation = ref<number>(0);
const dragStartTime = ref<number>(0);
const defaultIndex = 2;
const currentRotation = ref(-(defaultIndex * circleConfig.value.realStep));

const isHovering = ref<boolean>(false);
const cursorRef = ref<any>(null);

const onMouseEnter = () => {
  isHovering.value = true;
};
const onMouseLeave = () => {
  isHovering.value = false;
  isDragging.value = false;
};

const onMouseMove = (e: MouseEvent | TouchEvent) => {
  if (cursorRef.value?.el) {
    const clientX =
      (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0;
    const clientY =
      (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY ?? 0;
    cursorRef.value.el.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  }
  if (isDragging.value) {
    if ((e as TouchEvent).type === "touchmove")
      (e as TouchEvent).preventDefault();
    const currentX =
      (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0;
    const diff = currentX - startX.value;
    const sensitivity = (180 / Math.PI / props.radius) * 2.5;
    currentRotation.value = startRotation.value + diff * sensitivity;
  }
};

const wheelStyle = computed(() => {
  const topOffset = props.radius + props.cardHeight / 2 + 30;
  return {
    width: `${props.radius * 2}px`,
    height: `${props.radius * 2}px`,
    top: `${topOffset}px`,
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${currentRotation.value}deg)`,
  } as any;
});

const getCardStyle = (index: number): any => {
  const { realStep } = circleConfig.value;
  const angle = index * realStep;
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${props.cardWidth}px`,
    height: `${props.cardHeight}px`,
    marginLeft: `-${props.cardWidth / 2}px`,
    marginTop: `-${props.cardHeight / 2}px`,
    transform: `rotate(${angle}deg) translate(0, -${props.radius}px)`,
  } as any;
};

const isCardActive = (index: number) => {
  const { realStep } = circleConfig.value;
  let normalizedRotation = -currentRotation.value;
  let currentAngleInCircle = normalizedRotation % 360;
  if (currentAngleInCircle < 0) currentAngleInCircle += 360;
  const cardAngle = index * realStep;
  let diff = Math.abs(currentAngleInCircle - cardAngle);
  if (diff > 180) diff = 360 - diff;
  return diff < realStep / 2;
};

const startDrag = (e: MouseEvent | TouchEvent) => {
  gsap.killTweensOf(currentRotation);
  isDragging.value = true;
  dragStartTime.value = Date.now();
  startX.value =
    (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0;
  startRotation.value = currentRotation.value;

  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);
  document.addEventListener("mousemove", onGlobalMove as EventListener);
  document.addEventListener("touchmove", onGlobalMove as EventListener, {
    passive: false,
  });
};

const onGlobalMove = (e: Event) => {
  if (isDragging.value) {
    onMouseMove(e as MouseEvent | TouchEvent);
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchend", stopDrag);
  document.removeEventListener("mousemove", onGlobalMove);
  document.removeEventListener("touchmove", onGlobalMove);
  smoothSnap();
};

const smoothSnap = () => {
  const { realStep } = circleConfig.value;
  const dragDistance = currentRotation.value - startRotation.value;
  const momentum = dragDistance * 0.8;
  const projectedRotation = currentRotation.value + momentum;
  const rawIndex = Math.round(projectedRotation / realStep);
  const targetAngle = rawIndex * realStep;

  gsap.to(currentRotation, {
    value: targetAngle,
    duration: 1.2,
    ease: "power3.out",
    overwrite: true,
  });
};

const handleCardClick = (item: DocItem) => {
  if (Date.now() - dragStartTime.value < 200 && item.url) {
    window.open(item.url, "_blank");
  }
};

const animateExit = () => {
  if (!container.value) return Promise.resolve();
  const targets = container.value.querySelectorAll(".card-inner-anim");

  return new Promise<void>((resolve) => {
    gsap.to(targets, {
      y: -150,
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      stagger: {
        amount: 0.1,
        from: "center",
      },
      ease: "power2.in",
      onComplete: resolve,
    });
  });
};

const animateEnter = () => {
  if (!container.value) return Promise.resolve();
  const targets = container.value.querySelectorAll(".card-inner-anim");

  return new Promise<void>((resolve) => {
    gsap.fromTo(
      targets,
      { y: 150, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: {
          amount: 0.1,
          from: "center",
        },
        ease: "back.out(1.2)",
        onComplete: resolve,
      }
    );
  });
};

defineExpose({
  animateExit,
  animateEnter,
});
</script>

<style scoped>
.wheel-root {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible;
  cursor: grab;
  user-select: none;
  z-index: 1;
}

.wheel-root:active {
  cursor: grabbing;
}

.wheel-stage {
  position: absolute;
  pointer-events: none;
  will-change: transform;
}

.card-wrapper {
  pointer-events: auto;
}

.card-inner-anim {
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
}

.category-tabs {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-item {
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: #fff;
  background: var(--primary-color);
  font-weight: 500;
}
</style>
