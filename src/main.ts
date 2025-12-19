import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'

// 引入全局样式
import './assets/styles/main.scss'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)

app.mount('#app')

// Vue 挂载完成，结束Loading页面
if (window.finishLoading) {
  window.finishLoading();
}
