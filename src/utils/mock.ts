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
      codeSnippet: i % 2 === 0 ? CODE_SAMPLE : '' 
    })
  }

  // 按日期降序排列
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
