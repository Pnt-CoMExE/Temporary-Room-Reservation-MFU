import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // นำเข้า Router ที่เราสร้างไว้
import './assets/main.css' // ไฟล์ Tailwind
// Font Awesome — SVG tree-shaking (เฉพาะ icon ที่ใช้)
import { registerFontAwesome } from './plugins/fontawesome'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import i18n from "./i18n";

const app = createApp(App)

app.use(router) // สั่งให้ Vue ใช้งาน Router
app.use(i18n) // สั่งให้ Vue ใช้งาน i18n Multi-language
registerFontAwesome(app)
app.use(Toast, {
  position: "top-right", // ให้อยู่มุมขวาบน
  timeout: 3000, // โชว์แค่ 3 วินาทีแล้วหายไป
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false    
});
app.mount('#app')
