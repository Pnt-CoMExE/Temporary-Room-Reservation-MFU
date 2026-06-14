<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { getCookie } from "@/services/api";

const router = useRouter();
const route = useRoute();
const toast = useToast();

// ✅ อ่านข้อมูลหลัง Google OAuth redirect กลับมา
// Server ส่ง loginSuccess=true&role=...&name=...&email=... (ไม่มี token ใน URL)
// Token อยู่ใน cookie "mfu_token" ที่ server set ไว้แล้ว
onMounted(() => {
  const { loginSuccess, role, name, email } = route.query as Record<string, string>;

  if (loginSuccess === "true") {
    // ตรวจสอบว่า cookie ถูก set จริง
    const token = getCookie("mfu_token");
    if (!token) {
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่");
      return;
    }

    // บันทึกข้อมูล UI ลง localStorage (ไม่ใช่ token)
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", decodeURIComponent(name));
    localStorage.setItem("userEmail", decodeURIComponent(email));
    localStorage.setItem("isLoggedIn", "true");

    toast.success(`ยินดีต้อนรับคุณ ${decodeURIComponent(name)}! 👋`);

    // ล้าง query string ออกจาก URL แล้ว redirect
    if (role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/home");
    }
  }
});

// ----------------------------------------------------
// ฟังก์ชันสำหรับ Login ด้วย Google
// ----------------------------------------------------
const loginWithGoogle = () => {
  toast.info("กำลังนำคุณไปยังหน้า Login ของ Google...", {
    timeout: 2000,
  });

  const apiBaseURL = (import.meta as Record<string, any>).env.VITE_API_URL || "http://localhost:3000";

  // ยิงไปที่ Backend เพื่อเริ่ม OAuth flow
  setTimeout(() => {
    window.location.href = `${apiBaseURL}/api/auth/google`;
  }, 1000);
};
</script>

<template>
  <div
    class="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900 font-sans"
  >
    <!-- 🌄 พื้นหลัง MFU -->      <div class="absolute inset-0 z-0">
        <picture>
          <source srcset="/images/mfu-bg.avif" type="image/avif">
          <source srcset="/images/mfu-bg.webp" type="image/webp">
          <img
            src="/images/mfu-bg.jpg"
            alt="MFU Background"
            class="w-full h-full object-cover filter brightness-[0.4]"
          />
        </picture>
      <div
        class="absolute inset-0 bg-linear-to-b from-[#ba0b2f]/30 via-black/60 to-black/90"
      ></div>
    </div>

    <div class="relative z-10 w-full max-w-md px-4 sm:px-0">
      <!-- 🎓 หัวข้อระบบ -->
      <div class="text-center mb-8 animate-fade-down">
        <img
          src="/images/mfu-logo-white.svg"
          alt="MFU Logo"
          class="h-20 w-auto mx-auto mb-4"
        />
        <h1
          class="text-4xl font-extrabold text-white tracking-wider drop-shadow-lg"
        >
          <span class="text-[#d4af37]">MFU</span> PROPERTY
        </h1>
        <p class="text-gray-300 mt-2 text-sm font-medium">
          ระบบบริหารจัดการพื้นที่เช่าชั่วคราว
        </p>
      </div>

      <!-- 📦 กล่อง Login Card -->
      <div
        class="bg-white/95 backdrop-blur-xl rounded-4xl shadow-2xl p-8 sm:p-10 border border-white/20 transform transition-all hover:scale-[1.01] animate-fade-up min-h-80 flex flex-col justify-center"
      >
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner border-4 border-white transition-all duration-300 text-[#ba0b2f] bg-red-50"
          >
            <FontAwesomeIcon :icon="['fas', 'fingerprint']" class="text-3xl" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
          <p class="text-sm font-medium transition-colors duration-300 text-gray-500">
            กรุณาเข้าสู่ระบบด้วยบัญชี Google ของท่าน
          </p>
        </div>

        <div class="relative">
          <div class="space-y-4 animate-fade-up">
            <button
              @click="loginWithGoogle"
              class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group cursor-pointer"
            >
              <img
                class="h-5 w-5 transition-transform group-hover:scale-110"
                src="/images/google-color.svg"
                alt="Google logo"
                loading="lazy"
              />
              <span
                class="font-bold text-gray-700 text-sm tracking-wide group-hover:text-gray-900"
              >
                Sign in with Google
              </span>
            </button>
          </div>
        </div>
        <!-- จบพื้นที่สลับเนื้อหา -->
      </div>

      <!-- 📝 Footer -->
      <div class="text-center mt-8 text-gray-400 text-xs font-medium">
        &copy; 2026 Mae Fah Luang University.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations if not using external Tailwind plugins */
@keyframes fade-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-down {
  animation: fade-down 0.8s ease-out forwards;
}
.animate-fade-up {
  animation: fade-up 0.8s ease-out forwards;
}
</style>
