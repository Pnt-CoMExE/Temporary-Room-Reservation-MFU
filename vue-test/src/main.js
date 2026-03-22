import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // นำเข้า Router ที่เราสร้างไว้
import './assets/main.css' // ไฟล์ Tailwind
import '@fortawesome/fontawesome-free/css/all.css' // นำเข้า Font Awesome CSS

const app = createApp(App)

app.use(router) // สั่งให้ Vue ใช้งาน Router
app.mount('#app')