import { createDiscreteApi } from 'naive-ui'

// 使用默认配置，会创建一个独立的消息容器
const { message, notification, dialog, loadingBar } = createDiscreteApi(
  ['message', 'notification', 'dialog', 'loadingBar']
)

export { message, notification, dialog, loadingBar }
