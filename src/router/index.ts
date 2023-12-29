import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 静态路由菜单
 */
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/Home.vue')
  }
]

/** 路由实例 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

/** 安装vue-router */
export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
