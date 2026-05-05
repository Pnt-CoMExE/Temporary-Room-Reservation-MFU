<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

// ตัวแปรสำหรับสลับโหมด: false = โหมดจริง (Google), true = โหมดทดสอบ (2 Roles)
const isTestMode = ref(false);

// ----------------------------------------------------
// 1. ฟังก์ชันสำหรับ Login ด้วย Google (Production Mode)
// ----------------------------------------------------
const loginWithGoogle = () => {
  // console.log("Redirecting to Google OAuth...");
  // window.location.href = '/api/auth/google'; // เปิดใช้เมื่อต่อ Backend
  toast.info("ระบบกำลังพาท่านไปยังหน้า Login ของ Google...", {
    timeout: 2000,
  });
};

// ----------------------------------------------------
// 2. ฟังก์ชันสำหรับจำลองการล็อกอิน (Test Mode)
// ----------------------------------------------------
const handleMockLogin = (role) => {
  toast.info(`กำลังเข้าสู่ระบบในฐานะ ${role.toUpperCase()}...`, {
    timeout: 1500,
  });

  setTimeout(() => {
    // เซ็ตสถานะว่าล็อกอินแล้ว
    localStorage.setItem("isLoggedIn", "true");

    // จำลองข้อมูลตาม Role ที่เลือก
    if (role === "admin") {
      localStorage.setItem("userEmail", "admin.prop@mfu.ac.th");
      localStorage.setItem("userName", "เจ้าหน้าที่ แอดมิน");
      localStorage.setItem("userRole", "admin"); // เก็บ Role ไว้ด้วย
      toast.success("เข้าสู่ระบบ Admin สำเร็จ! 🛡️");
      router.push("/admin/dashboard"); // เด้งไปหน้าแอดมิน
    } else {
      localStorage.setItem("userEmail", "student@lamduan.mfu.ac.th");
      localStorage.setItem("userName", "นักศึกษา ทดสอบ");
      localStorage.setItem("userRole", "user");
      toast.success("เข้าสู่ระบบ User สำเร็จ! 👋");
      router.push("/home"); // เด้งไปหน้า User
    }
  }, 1000);
};
</script>

<template>
  <div
    class="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900 font-sans"
  >
    <!-- 🎛️ ปุ่ม Toggle สลับโหมด (มุมขวาบน) สำหรับ Developer 🎛️ -->
    <div
      class="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg cursor-pointer select-none"
      @click="isTestMode = !isTestMode"
    >
      <span
        class="text-xs font-bold tracking-wide transition-colors"
        :class="!isTestMode ? 'text-white' : 'text-gray-400'"
        >PROD</span
      >
      <button
        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none"
        :class="isTestMode ? 'bg-[#ba0b2f]' : 'bg-gray-500'"
      >
        <span
          class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300"
          :class="isTestMode ? 'translate-x-4' : 'translate-x-1'"
        />
      </button>
      <span
        class="text-xs font-bold tracking-wide transition-colors"
        :class="isTestMode ? 'text-[#d4af37]' : 'text-gray-400'"
        >TEST</span
      >
    </div>

    <!-- 🌄 พื้นหลัง MFU -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
        alt="MFU Background"
        class="w-full h-full object-cover filter brightness-[0.4]"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-[#ba0b2f]/30 via-black/60 to-black/90"
      ></div>
    </div>

    <div class="relative z-10 w-full max-w-md px-4 sm:px-0">
      <!-- 🎓 หัวข้อระบบ -->
      <div class="text-center mb-8 animate-fade-down">
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
            class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner border-4 border-white transition-all duration-300"
            :class="
              isTestMode
                ? 'text-[#d4af37] bg-gray-900'
                : 'text-[#ba0b2f] bg-red-50'
            "
          >
            <i
              class="fas"
              :class="isTestMode ? 'fa-laptop-code' : 'fa-fingerprint'"
            ></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
          <p
            class="text-sm font-medium transition-colors duration-300"
            :class="isTestMode ? 'text-[#ba0b2f]' : 'text-gray-500'"
          >
            {{
              isTestMode
                ? "โหมดทดสอบสำหรับนักพัฒนา (Test Mode)"
                : "กรุณาเข้าสู่ระบบด้วยบัญชี Google ของท่าน"
            }}
          </p>
        </div>

        <!-- 🔄 พื้นที่สลับเนื้อหาภายในกล่อง -->
        <div class="relative">
          <!-- ========================================== -->
          <!-- 🟢 โหมดใช้งานจริง (Production) - ปุ่ม Google -->
          <!-- ========================================== -->
          <div v-if="!isTestMode" class="space-y-4 animate-fade-up">
            <button
              @click="loginWithGoogle"
              class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
            >
              <img
                class="h-5 w-5 transition-transform group-hover:scale-110"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              <span
                class="font-bold text-gray-700 text-sm tracking-wide group-hover:text-gray-900"
              >
                Sign in with Google
              </span>
            </button>
          </div>

          <!-- ========================================== -->
          <!-- 🟠 โหมดทดสอบ (Test) - ปุ่ม 2 Role          -->
          <!-- ========================================== -->
          <div v-else class="space-y-4 animate-fade-up">
            <div class="relative flex py-2 items-center">
              <div class="grow border-t border-gray-200"></div>
              <span
                class="shrink-0 mx-4 text-xs text-gray-400 font-bold tracking-widest uppercase"
                >เลือก Role เพื่อจำลอง</span
              >
              <div class="grow border-t border-gray-200"></div>
            </div>

            <button
              @click="handleMockLogin('user')"
              class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
            >
              <i
                class="fas fa-user text-gray-400 group-hover:text-[#ba0b2f]"
              ></i>
              <span
                class="font-bold text-gray-700 text-sm tracking-wide group-hover:text-gray-900"
              >
                เข้าสู่ระบบฐานะ <span class="text-[#ba0b2f]">User</span> ปกติ
              </span>
            </button>

            <button
              @click="handleMockLogin('admin')"
              class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 border-2 border-gray-900 rounded-xl hover:bg-black transition-all shadow-md shadow-gray-900/20 group"
            >
              <i class="fas fa-user-shield text-[#d4af37]"></i>
              <span class="font-bold text-white text-sm tracking-wide">
                เข้าสู่ระบบฐานะ <span class="text-[#d4af37]">Admin</span>
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
