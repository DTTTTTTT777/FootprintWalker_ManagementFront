import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
const pathSrc = path.resolve(__dirname,'src')
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/foreignImage": {
        target:"https://smms.app/api/v2",
        rewrite:(path)=>path.replace(/^\/foreignImage/,""),
        changeOrigin: true,

      },
      "/api": {
        target:"http://42.192.39.198:5000",
        changeOrigin: true,

      }
    },
  },
  plugins: [
    vue(),
    AutoImport({
      imports:[
          'vue',
          'vue-router',
      ],
      resolvers:[
          ElementPlusResolver(),
          IconsResolver({
            prefix:'Icon',
          }),
      ],
      dts:path.resolve(pathSrc,'auto-imports.d.ts'),
    }),
    Components({
      resolvers:[
          IconsResolver({
            enabledCollections:['ep'],
          }),
          ElementPlusResolver(),
      ],
      dts:path.resolve(pathSrc,'component.d.ts'),
    })  ,
    Icons({
      autoInstall:true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
