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
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else if (to.name === "login" && isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
