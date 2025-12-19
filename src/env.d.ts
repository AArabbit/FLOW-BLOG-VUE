/// <reference types="vite/client" />
export { };
// 定义环境变量的类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DROP_CONSOLE: string
  readonly VITE_API_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    finishLoading?: () => void; // 声明这个方法是可选的，无返回值的函数
  }
}
