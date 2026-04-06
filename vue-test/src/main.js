import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // นำเข้า Router ที่เราสร้างไว้
import './assets/main.css' // ไฟล์ Tailwind
import '@fortawesome/fontawesome-free/css/all.css' // นำเข้า Font Awesome CSS
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App)

app.use(router) // สั่งให้ Vue ใช้งาน Router
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