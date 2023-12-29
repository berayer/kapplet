import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'

import '@/style/main.css'

async function setupApp() {
  const app = createApp(App)
  // 安装路由
  await setupRouter(app)
  // 挂载实例
  app.mount('#app')
}

// 安装app
setupApp()
