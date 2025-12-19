<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PhArrowUpRight, PhGithubLogo, PhCopyright } from "@phosphor-icons/vue";

gsap.registerPlugin(ScrollTrigger);

// 配置信息
const icpRecord = "京ICP备0999999999号";
const icpLink = "https://beian.miit.gov.cn";
const githubLink = "https://github.com/AArabbit";

const footerRef = ref<HTMLElement | null>(null);
const route = useRoute();
let ctx: gsap.Context;
let resizeObserver: ResizeObserver | null = null;

const initAnimation = () => {
  if (!footerRef.value) return;

  if (ctx) ctx.revert();

  ctx = gsap.context(() => {
    gsap.set(".divider-line", { scaleX: 0, transformOrigin: "left center" });
    gsap.set(".anim-text", { y: 20, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.value,
        start: "top 95%",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    tl.to(".divider-line", {
      scaleX: 1,
      duration: 1,
      ease: "none",
    });

    tl.to(
      ".anim-text",
      {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.8,
        ease: "none",
      },
      "< 0.1"
    );
  }, footerRef.value);
};

const refreshTrigger = () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
};

onMounted(() => {
  initAnimation();
  resizeObserver = new ResizeObserver(() => {
    refreshTrigger();
  });
  resizeObserver.observe(document.body);
});

// 3. 监听路由变化
watch(
  () => route.path,
  () => {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
  }
);

onUnmounted(() => {
  if (ctx) ctx.revert();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <footer ref="footerRef" class="minimal-footer">
    <div class="content-wrapper">
      <div class="top-row">
        <h2 class="slogan anim-text">Stay hungry. Stay foolish.</h2>
      </div>

      <div class="divider-wrapper">
        <div class="divider-line"></div>
      </div>

      <div class="bottom-row">
        <div class="left-group">
          <a :href="githubLink" target="_blank" class="plain-link anim-text">
            <span>Github</span>
            <PhGithubLogo class="icon-small" weight="fill" />
          </a>
        </div>

        <div class="right-group anim-text">
          <a :href="icpLink" target="_blank" class="plain-link anim-text">
            <span>{{ icpRecord }}</span>
            <PhArrowUpRight class="icon-small" />
          </a>
          <span class="separator anim-text">/</span>
          <PhCopyright class="icon-small" />
          <span>2025 Flow Blog</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.minimal-footer {
  width: 100%;
  background-color: #0a0a0a;
  color: #fff;
  padding: 60px 40px 40px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
}

.top-row {
  margin-bottom: 20px;
  .slogan {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.5rem;
    font-weight: 500;
    color: #e5e5e5;
    margin: 0;
    letter-spacing: -0.02em;
  }
}

.divider-wrapper {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;

  .divider-line {
    width: 100%;
    height: 100%;
    background: #555;
  }
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: monospace;
  font-size: 0.85rem;
  color: #888;
}

.left-group {
  display: flex;
  align-items: center;
  gap: 16px;
  .separator {
    color: #333;
  }
}

.plain-link {
  text-decoration: none;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s ease;
  position: relative;

  .icon-small {
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #fff;
    .icon-small {
      transform: translate(2px, -2px);
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #fff;
    transition: width 0.3s ease;
  }
  &:hover::after {
    width: 100%;
  }
}

.right-group {
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

@media (max-width: 768px) {
  .minimal-footer {
    padding: 40px 20px;
  }
  .top-row .slogan {
    font-size: 1.2rem;
  }
  .bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .left-group {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
