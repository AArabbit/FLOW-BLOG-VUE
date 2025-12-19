<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { NButton, NAvatar, NDropdown } from "naive-ui";
import { usePostStore } from "@/stores/posts";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import gsap from "gsap";
import { PhKanban, PhMagnifyingGlass, PhGear } from "@phosphor-icons/vue";

const router = useRouter();
const postStore = usePostStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const uiStore = useUIStore();

const navRef = ref<HTMLElement | null>(null); // 绑定导航栏 DOM
const isFloating = ref(false); // 记录当前状态

const openSettings = () => {
  uiStore.toggleSettings(true);
};

const userOptions = [
  { label: "个人中心", key: "profile" },
  { label: "退出登录", key: "logout" },
];
const handleUserSelect = (key: string) => {
  if (key === "logout") {
    authStore.logout();
    router.push("/");
  } else if (key === "profile") router.push("/profile");
};

const adminOptions = [
  { label: "文章管理", key: "posts" },
  { label: "用户管理", key: "users" },
  { label: "访客管理", key: "visitors" },
];
const handleAdminSelect = (key: string) => {
  if (key === "posts") router.push("/admin/posts");
  if (key === "users") router.push("/admin/users");
  if (key === "visitors") router.push("/admin/visitors");
};

// 处理滚动动画
const handleScroll = () => {
  const scrollY = window.scrollY;
  const threshold = 200; // 建议把阈值调小一点，250太大了，移动端滑很久才变

  if (!navRef.value) return;

  const logo = navRef.value.querySelector(".logo");
  const menu = navRef.value.querySelector(".menu");
  const actions = navRef.value.querySelector(".actions");
  const root = document.documentElement;

  // 判断是否为移动端 (断点 768px)
  const isMobile = window.innerWidth < 768;

  // 变为悬浮胶囊
  if (scrollY > threshold && !isFloating.value) {
    isFloating.value = true;

    // 导航栏容器动画
    gsap.to(navRef.value, {
      top: isMobile ? 10 : 15,
      height: "54px",
      width: isMobile ? "92%" : "75%",
      maxWidth: "900px",
      borderRadius: "50px",
      paddingLeft: isMobile ? "16px" : "24px",
      paddingRight: isMobile ? "16px" : "24px",
      backgroundColor: "var(--nav-capsule-bg)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid var(--border-light)",
      backdropFilter: "blur(15px)",
      duration: 0.5,
      ease: "power3.out",
    });

    gsap.to(root, {
      "--nav-bottom-pos": "80px",
      duration: 0.5,
      ease: "power3.out",
    });

    // Logo 缩小
    gsap.to(logo, {
      scale: 0.9,
      transformOrigin: "left center",
      duration: 0.5,
    });

    // 菜单文字缩小
    gsap.to(menu, {
      scale: 0.9,
      gap: "20px",
      duration: 0.5,
    });

    // 右侧按钮整体缩小
    gsap.to(actions, {
      scale: 0.85,
      transformOrigin: "right center",
      duration: 0.5,
    });
  }

  // 恢复原始状态
  else if (scrollY <= threshold && isFloating.value) {
    isFloating.value = false;

    // 恢复容器
    gsap.to(navRef.value, {
      top: 0,
      height: "80px",
      width: "100%",
      maxWidth: "none",
      borderRadius: 0,
      paddingLeft: "5vw",
      paddingRight: "5vw",
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "1px solid transparent",
      backdropFilter: "blur(0px)",
      duration: 0.5,
      ease: "power3.out",
    });

    gsap.to(root, {
      "--nav-bottom-pos": "80px",
      duration: 0.5,
      ease: "power3.out",
    });

    // 恢复Logo
    gsap.to(logo, {
      scale: 1,
      duration: 0.5,
    });

    // 恢复菜单
    gsap.to(menu, {
      scale: 1,
      gap: "40px",
      duration: 0.5,
    });

    // 恢复按钮
    gsap.to(actions, {
      scale: 1,
      duration: 0.5,
    });
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  // 初始检查
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <!-- 绑定 ref -->
  <nav class="nav-container" ref="navRef">
    <div class="logo" @click="router.push('/')">
      FLOW<span :style="{ color: themeStore.themeColor }">.</span>BLOG
    </div>

    <div class="menu">
      <router-link to="/" class="menu-item" active-class="active"
        >首页</router-link
      >
      <router-link to="/articles" class="menu-item" active-class="active"
        >文章</router-link
      >
      <router-link to="/featured" class="menu-item" active-class="active"
        >精选</router-link
      >
      <router-link to="/timeline" class="menu-item" active-class="active"
        >时间轴</router-link
      >

      <div class="menu-item dropdown">
        <span>分类探索</span>
        <div class="dropdown-content">
          <router-link
            v-for="cat in postStore.categories"
            :key="cat.id"
            :to="`/category/${cat.id}`"
          >
            {{ cat.name }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="actions">
      <n-dropdown
        v-if="authStore.user?.role === 'admin'"
        :options="adminOptions"
        @select="handleAdminSelect"
      >
        <n-button
          round
          secondary
          type="primary"
          size="small"
          style="margin-right: 12px; font-weight: bold"
        >
          <template #icon><PhKanban /></template> 控制台
        </n-button>
      </n-dropdown>

      <n-button
        circle
        secondary
        @click="themeStore.toggleSearch(true)"
        style="margin-right: 12px"
      >
        <template #icon><PhMagnifyingGlass style="font-size: 20px" /></template>
      </n-button>

      <div class="user-action" style="margin-right: 12px; display: inline-flex">
        <n-dropdown
          v-if="authStore.user"
          :options="userOptions"
          @select="handleUserSelect"
        >
          <n-avatar
            round
            :src="authStore.user.avatar"
            size="small"
            style="cursor: pointer"
          />
        </n-dropdown>
        <n-button
          v-else
          size="small"
          round
          secondary
          @click="uiStore.toggleLoginModal(true)"
          >Login</n-button
        >
      </div>

      <n-button circle secondary @click="openSettings">
        <template #icon><PhGear style="font-size: 20px" /></template>
      </n-button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/_mixins.scss" as *;
@use "@/assets/styles/_variables.scss" as *;

.nav-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 80px; // 初始高度
  @include flex-between;

  // 初始 Padding
  padding-left: 5vw;
  padding-right: calc(5vw + var(--scrollbar-gap, 0px));

  z-index: z("navbar");

  // 初始模糊效果
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: color 0.4s ease, border-color 0.4s ease;
  overflow: visible;
}

.logo {
  font-family: $font-main;
  font-weight: 700;
  font-size: 1.5rem;
  cursor: pointer;
  letter-spacing: -0.05em;
  user-select: none;
  color: var(--text-main);
  white-space: nowrap;
  transform-origin: left center;
  @include mobile {
    font-size: 1.25rem;
  }
}

.menu {
  @include flex(center, center);
  gap: 40px;
  transform-origin: center center;

  @include mobile {
    display: none;
  }
}

.menu-item {
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
  transition: color 0.3s;
  cursor: pointer;
  color: var(--text-main);
  white-space: nowrap;

  &:hover,
  &.active {
    color: var(--primary-color);
  }

  // 下划线样式
  &:not(.dropdown).active::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--primary-color);
  }
}

.dropdown {
  position: relative;
  padding: 10px 0;
  cursor: pointer;

  span {
    transition: color 0.3s;
  }

  &:hover span {
    color: var(--primary-color);
  }

  .dropdown-content {
    @include abs-center;
    @include flex-col;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    padding: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    min-width: 140px;
    gap: 5px;
    border: 1px solid var(--border-light);
    z-index: z("dropdown");
    display: none;
    margin-top: 10px;

    &::before {
      content: "";
      position: absolute;
      top: -20px;
      left: 0;
      width: 100%;
      height: 20px;
      background: transparent;
    }
  }

  &:hover .dropdown-content {
    display: flex;
  }

  .dropdown-content a {
    padding: 10px 16px;
    font-size: 0.9rem;
    color: var(--text-sub);
    border-radius: 6px;
    white-space: nowrap;
    text-align: center;

    &:hover {
      background: rgba(125, 125, 125, 0.1);
      color: var(--primary-color);
    }
  }
}

.actions {
  @include flex(center, center);
  gap: 12px;
  flex-shrink: 0;
  transform-origin: right center;
  // 移动端减小按钮间距
  @include mobile {
    gap: 8px;
  }
}
</style>
