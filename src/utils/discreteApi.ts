import { createDiscreteApi } from 'naive-ui'

// 配置项 (可选)：可以在这里传入主题配置，以适配暗黑模式
// 使用默认配置，会创建一个独立的消息容器
const { message, notification, dialog, loadingBar } = createDiscreteApi(
  ['message', 'notification', 'dialog', 'loadingBar']
)

export { message, notification, dialog, loadingBar }
