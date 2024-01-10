import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'dayjs/locale/zh-cn'
import router from './router/index.js'
import { createPinia } from "pinia";
import { useUserInfo } from './store/userInfo'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import Print from 'vue3-print-nb'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '../theme/index.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)
app.use(Print)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
app.use(pinia)
app.use(ElementPlus, {
    locale: zhCn
})

app.directive('permiss',
    (el, binding) =>{
        const role = useUserInfo().userRole
        let flag = false;
        if (!Array.isArray(binding.value) || binding.value.length === 0)
            flag = true
        if (Array.isArray(role)&&Array.isArray(binding.value)) {
            role.forEach(element => {
                if (binding.value.includes(element)) {
                    flag = true;
                }
            });
        }
        if (flag === false) {
            el['hidden'] = true;
        }
    }
)
app.mount("#app")