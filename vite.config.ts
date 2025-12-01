import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// mode：'development' 或 'production'
export default defineConfig(({ mode }) => {
  // 加载当前模式下的环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      // 注入 HTML 变量
      createHtmlPlugin({
        inject: {
          data: {
            title: env.VITE_APP_TITLE, // 将 .env 中的标题注入到 index.html
          },
        },
      }),
    ],
    base: "./",
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // 构建配置
    esbuild: {
      // 生产环境去除 console 和 debugger
      drop: env.VITE_DROP_CONSOLE === 'true' ? ['console', 'debugger'] : []
    },
    // 解决开发环境跨域
    server: {
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // 消除特定的废弃警告
          silenceDeprecations: ['legacy-js-api'],
          additionalData: `
            @use "@/assets/styles/_variables.scss" as *;
            @use "@/assets/styles/_mixins.scss" as *;
          `
        }
      }
    }
  }
})
