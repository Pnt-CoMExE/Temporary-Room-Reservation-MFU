import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import LoginView from "@/views/users/LoginView.vue";
import { getCookie } from "@/services/api";

const routes: RouteRecordRaw[] = [
  // 1. หน้า Login (เปิดมาเจอหน้านี้ก่อน)
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: {
      title: "เข้าสู่ระบบ",
      description:
        "เข้าสู่ระบบจองพื้นที่อาคารและสถานที่ มหาวิทยาลัยแม่ฟ้าหลวง MFU",
    },
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
        meta: {
          title: "หน้าหลัก",
          description:
            "ค้นหาและจองพื้นที่อาคารและสถานที่ภายในมหาวิทยาลัยแม่ฟ้าหลวง (MFU) สำหรับจัดกิจกรรม การประชุม และอบรม",
        },
      },
      {
        path: "/rooms",
        name: "room-list",
        component: () => import("@/views/users/RoomListView.vue"),
        meta: {
          title: "รายการห้องประชุม",
          description:
            "ค้นหาและเปรียบเทียบห้องประชุม ห้องสัมมนา และพื้นที่จัดกิจกรรมของมหาวิทยาลัยแม่ฟ้าหลวง พร้อมข้อมูลราคาและสิ่งอำนวยความสะดวก",
        },
      },
      {
        path: "/rooms/:id",
        name: "room-detail",
        component: () => import("@/views/users/RoomDetailView.vue"),
        meta: {
          title: "รายละเอียดห้องประชุม",
          description:
            "ดูรายละเอียดห้องประชุม ราคาค่าบริการ สิ่งอำนวยความสะดวก และดำเนินการจองพื้นที่มหาวิทยาลัยแม่ฟ้าหลวง",
        },
      },
      {
        path: "/booking/:id",
        name: "booking",
        component: () => import("@/views/users/BookingView.vue"),
        meta: {
          title: "จองพื้นที่",
          description:
            "กรอกข้อมูลและดำเนินการจองพื้นที่อาคารและสถานที่ มหาวิทยาลัยแม่ฟ้าหลวง พร้อมเลือกรอบเวลาและบริการเพิ่มเติม",
        },
      },
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/users/DashboardView.vue"),
        meta: {
          title: "แดชบอร์ดของฉัน",
          description:
            "จัดการการจองของฉัน ดูประวัติการจอง และข้อมูลส่วนตัว - ระบบจองพื้นที่อาคารและสถานที่ มฟล.",
        },
      },
    ],
  },
  // 3. กลุ่มหน้า Admin (ทุกหน้าในนี้จะถูกสวมหน้ากาก AdminLayout)
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/views/admin/AdminDashboardView.vue"),
        meta: {
          title: "แดชบอร์ดผู้ดูแลระบบ",
          description:
            "แดชบอร์ดผู้ดูแลระบบ จัดการห้องประชุม การจอง แบนเนอร์ และโปรโมชั่น - ระบบจองพื้นที่อาคารและสถานที่ มฟล.",
        },
      },
    ],
  },
  // 4. 404 — Not Found
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: {
      title: "ไม่พบหน้า",
      description: "ไม่พบหน้าที่คุณค้นหา — ระบบจองพื้นที่อาคารและสถานที่ มฟล.",
    },
  },
];

const router = createRouter({
  history: createWebHistory((import.meta as Record<string, any>).env.BASE_URL),
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
  routes,
});

// ระบบป้องกันคนไม่ล็อกอิน
router.beforeEach((to, _from) => {
  // ✅ เช็คทั้ง localStorage และ cookie
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" && !!getCookie("mfu_token");

  const publicPages = ["/"];
  const isNotFound = to.name === "not-found";
  const authRequired = !publicPages.includes(to.path) && !isNotFound;

  if (authRequired && !isLoggedIn) {
    return "/";
  }

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      return "/home";
    }
  }

  if (to.path === "/" && isLoggedIn) {
    // ถ้า "Login แล้ว" แต่ดันจะกดเข้าหน้า Login อีก -> เด้งไปหน้าที่เหมาะสม
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      return "/admin/dashboard";
    }
    return "/home";
  }

  return true;
});

// ─── Dynamic Meta Tags ────────────────────────────────────
const BASE_TITLE = "MFU Space Booking";
const FALLBACK_DESC =
  "ระบบจองพื้นที่อาคารและสถานที่ มหาวิทยาลัยแม่ฟ้าหลวง (MFU) สำหรับจัดกิจกรรม การประชุม สัมมนา และอบรม";

router.afterEach((to) => {
  const meta = to.meta;
  const title = meta?.title || "";
  document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

  const description = (meta?.description as string) || FALLBACK_DESC;
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", description);
});

export default router;
