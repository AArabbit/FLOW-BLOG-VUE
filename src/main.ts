import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router' // 稍后在第二批次创建
import naive from 'naive-ui'
// 引入 Fill 风格图标
import '@phosphor-icons/web/regular'
import '@phosphor-icons/web/fill' 

// 引入全局样式
import './assets/styles/main.scss'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(head)

app.mount('#app')
