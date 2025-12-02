import type { Post, Category } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 1, name: '深度技术', slug: 'tech' },
  { id: 2, name: '设计美学', slug: 'design' },
  { id: 3, name: '生活随笔', slug: 'life' },
  { id: 4, name: '未来观察', slug: 'future' },
  { id: 5, name: '摄影瞬间', slug: 'photo' }
]

// 示例代码片段
const CODE_SAMPLE = `// Vue 3 Composition API Example
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const increment = () => count.value++;

    onMounted(() => {
      console.log('Component mounted!');
    });

    return { count, increment };
  }
};`

const MARKDOWN_CONTENT = `
## 第一章节：起源与思考

在这个章节中，我们深入探讨技术的本质。随着 **Vue 3.0** 的发布，组合式 API 带来了逻辑复用的新范式。

### 核心概念

1.  **响应式系统**：基于 Proxy 的高性能实现
2.  **组合式 API**：更灵活的代码组织方式
3.  **Teleport**：内置的模态框解决方案

## 第二章节：构建现代化体验

设计不仅仅是视觉的堆砌。Awwwards 风格强调的是一种流动的体验（Flow）。

> "好的设计是显而易见的，伟大的设计是透明的。"

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

## 第三章节：未来的展望

这不仅是一个博客，更是一个技术游乐场。我们期待看到更多创新的交互方式。
`;

const TITLES = [
  "论 Vue3 的极致优化", "GSAP 动画设计的艺术", "2025 前端趋势观察",
  "极简主义生活指南", "WebGL 与 3D 交互", "TypeScript 类型体操",
  "Rust 重写前端工具链", "AI 辅助编程的思考", "设计系统构建实战",
  "微前端架构落地方案", "数字游民的生存法则", "组件库设计的哲学"
]

export const generatePosts = (count: number): Post[] => {
  const posts: Post[] = []

  for (let i = 1; i <= count; i++) {
    // 随机生成过去 2 年内的日期
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 365 * 2))

    posts.push({
      id: i,
      title: `${TITLES[i % TITLES.length]} - Vol.${i}`,
      desc: "在数字世界的洪流中，我们需要寻找一丝静谧与秩序。本文探讨了在复杂系统中保持代码优雅与性能极致平衡的多种可能性，结合实际案例深度剖析。",
      date: date.toISOString().split('T')[0],
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      readTime: Math.floor(Math.random() * 15) + 3,
      views: Math.floor(Math.random() * 5000) + 100,
      cover: `https://picsum.photos/seed/${i + 200}/800/500`,

      // 代码片段字段 (实际项目中这通常包含在 markdown content 中)
      // 这里为了展示 vue-prism-editor 单独提取出来
      codeSnippet: i % 2 === 0 ? CODE_SAMPLE : '',
      content: MARKDOWN_CONTENT
    })
  }

  // 按日期降序排列
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
