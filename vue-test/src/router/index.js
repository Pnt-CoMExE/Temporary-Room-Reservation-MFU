import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/users/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    // 1. หน้า Login (เปิดมาเจอหน้านี้ก่อน)
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    // 2. กลุ่มหน้า User (ทุกหน้าในนี้จะถูกสวมหน้ากาก UserLayout ที่มี Navbar + Footer)
    {
      path: "/user",
      component: () => import("@/layouts/UserLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "/home",
          name: "home",
          component: () => import("@/views/users/HomeView.vue"),
        },
        {
          path: "/rooms",
          name: "room-list",
          component: () => import("@/views/users/RoomListView.vue"),
        },
        {
          path: "/rooms/:id",
          name: "room-detail",
          component: () => import("@/views/users/RoomDetailView.vue"),
        },
        {
          path: "/booking/:id",
          name: "booking",
          component: () => import("@/views/users/BookingView.vue"),
        },
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/views/users/DashboardView.vue"),
        },
      ],
    },
    // 3. กลุ่มหน้า Admin (ทุกหน้าในนี้จะถูกสวมหน้ากาก AdminLayout)
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("@/views/admin/AdminDashboardView.vue"),
        },
      ],
    },
  ],
});

// ระบบป้องกันคนไม่ล็อกอิน
router.beforeEach((to, from, next) => {
  // เช็คว่ามีข้อมูล userEmail ใน localStorage ไหม (ถ้ามีแปลว่า Login แล้ว)
  const isLoggedIn = localStorage.getItem("userEmail");

  // กำหนดชื่อ path ที่อนุญาตให้เข้าได้โดยไม่ต้อง Login (เช่น หน้าล็อกอิน หรือหน้าสมัครสมาชิก)
  const publicPages = ["/"];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !isLoggedIn) {
    // 1. ถ้าหน้าที่กำลังจะไป "ต้อง Login" แต่ "ยังไม่ได้ Login" -> เด้งไปหน้า Login
    next("/");
  } else if (to.path === "/" && isLoggedIn) {
    // 2. ถ้า "Login แล้ว" แต่ดันจะกดเข้าหน้า Login อีก -> เด้งไปหน้า Dashboard หรือ Home
    next("/dashboard"); // หรือเปลี่ยนเป็น '/home' ตามที่คุณต้องการ
  } else {
    // 3. กรณีอื่นๆ ให้ผ่านเข้าหน้าได้ปกติ
    next();
  }
});

export default router;
