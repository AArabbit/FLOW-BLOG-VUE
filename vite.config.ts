import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from 'vite-plugin-compression'
import externalGlobals from 'rollup-plugin-external-globals'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// mode：'development' 或 'production'
export default defineConfig(({ mode, command }) => {
  // 加载当前模式下的环境变量
  const env = loadEnv(mode, process.cwd())
  const isProd = command === 'build'

  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            title: env.VITE_APP_TITLE, // 将 .env 中的标题注入到 index.html
            isProd: isProd,
          },
        },
      }),
      visualizer(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 大于10kb的文件才压缩
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // 打包vditor静态资源，首次必须把打包后的vditor文件夹一起上传
      // 后续服务器只需更新assets文件夹
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/vditor/dist',
            dest: 'vditor'
          }
        ]
      }),
    ],
    base: "/",
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      drop: env.VITE_DROP_CONSOLE === 'true' ? ['console', 'debugger'] : [],
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      rollupOptions: {
        external: isProd
          ? ['vue', 'vue-router', 'pinia', 'gsap', 'axios']
          : [],
        plugins: isProd ? [
          externalGlobals({
            "vue": "Vue",
            "vue-router": "VueRouter",
            "pinia": "Pinia",
            "gsap": "gsap",
            "axios": "axios",
          })
        ] : [],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lodash-es')) {
                return 'lodash-es'
              } else if (id.includes('matter')) {
                return 'matter-vendor'
              } else if (id.includes('naive-ui')) {
                return 'naive-vendor'
              } else if (id.includes('vditor')) {
                return 'vditor-vendor'
              } else if (id.includes('highlight.js')) {
                return 'highlight-vendor'
              } else if (id.includes('@phosphor-icons/vue')) {
                return '@phosphor-icons-vendor'
              }
            }
          }
        }
      },
    },
    // 解决开发环境跨域
    server: {
      open: true,
      proxy: {
        '/blog': {
          target: env.VITE_API_SERVER_URL,
          changeOrigin: true
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
    },
  }
})
