import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/", // หน้าแรกเป็น Login
      name: "login",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true }, // ติดล็อค
    },
    {
      path: "/rooms",
      name: "room-list",
      component: () => import("../views/RoomListView.vue"),
      meta: { requiresAuth: true }, // ติดล็อค
    },
    {
      path: "/rooms/:id",
      name: "room-detail",
      component: () => import("../views/RoomDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/booking/:id",
      name: "booking",
      component: () => import("../views/BookingView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// --- ส่วนสำคัญ: ตัวตรวจเช็คก่อนเปลี่ยนหน้า ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  if (to.name !== "login" && !isAuthenticated) {
    // ถ้าจะไปหน้าอื่นแต่ยังไม่ Login ให้เด้งกลับไป Login
    next({ name: "login" });
  } else if (to.name === "login" && isAuthenticated) {
    // ถ้า Login แล้วแต่จะพยายามเข้าหน้า Login อีก ให้ส่งไปหน้า Home
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
