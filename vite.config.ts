import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log('__miniappUtils.enableDev()')
  console.log(`__miniappUtils.loadApp("test", "http://localhost:5173/manifest.json")`)
  console.log(`__miniappUtils.unloadApp("test")`)

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue'],
        dts: 'src/types/auto-import.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        dts: 'src/types/auto-components.d.ts',
        resolvers: [NaiveUiResolver(), ElementPlusResolver()]
      })
    ],
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        input: ['/src/vm/main.ts', 'index.html'],
        output: {}
      },
      manifest: true
    }
  }
})
