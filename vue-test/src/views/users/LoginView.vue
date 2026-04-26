<script setup>
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

// ฟังก์ชันสำหรับจำลองการล็อกอิน โดยรับค่า role เข้ามา (user หรือ admin)
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

      <div
        class="bg-white/95 backdrop-blur-xl rounded-4xl shadow-2xl p-8 sm:p-10 border border-white/20 transform transition-all hover:scale-[1.01] animate-fade-up"
      >
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-red-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner border-4 border-white"
          >
            <i class="fas fa-fingerprint"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
          <p class="text-sm text-gray-500 font-medium">
            กรุณาเข้าสู่ระบบด้วยบัญชี Google ของท่าน
          </p>
        </div>

        <div class="space-y-4">
          <div class="relative flex py-2 items-center">
            <div class="grow border-t border-gray-200"></div>
            <span
              class="shrink-0 mx-4 text-xs text-gray-400 font-bold tracking-widest uppercase"
              >โหมดทดสอบ (เลือก Role)</span
            >
            <div class="grow border-t border-gray-200"></div>
          </div>

          <button
            @click="handleMockLogin('user')"
            class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
          >
            <i class="fas fa-user text-gray-400 group-hover:text-[#ba0b2f]"></i>
            <span
              class="font-bold text-gray-700 text-sm tracking-wide group-hover:text-gray-900"
              >เข้าสู่ระบบฐานะ
              <span class="text-[#ba0b2f]">User</span> ปกติ</span
            >
          </button>

          <button
            @click="handleMockLogin('admin')"
            class="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 border-2 border-gray-900 rounded-xl hover:bg-black transition-all shadow-md shadow-gray-900/20 group"
          >
            <i class="fas fa-user-shield text-[#d4af37]"></i>
            <span class="font-bold text-white text-sm tracking-wide"
              >เข้าสู่ระบบฐานะ <span class="text-[#d4af37]">Admin</span></span
            >
          </button>
        </div>
      </div>

      <div class="text-center mt-8 text-gray-400 text-xs font-medium">
        &copy; 2026 Mae Fah Luang University.
      </div>
    </div>
  </div>
</template>
