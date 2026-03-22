<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const handleLogout = () => {
  if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    router.push("/"); // กลับไปหน้า Login
  }
};
</script>

<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <div class="flex items-center">
          <RouterLink to="/home" class="flex items-center group">
            <div class="flex flex-col">
              <span class="text-xl font-bold text-[#ba0b2f] leading-none"
                >MFU</span
              >
              <span class="text-sm font-semibold text-[#d4af37] tracking-wider"
                >PROPERTY</span
              >
            </div>
          </RouterLink>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <RouterLink
            to="/home"
            class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors"
            >หน้าแรก</RouterLink
          >
          <RouterLink
            to="/rooms"
            class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors"
            >จองห้องพัก</RouterLink
          >
          <RouterLink
            to="/dashboard"
            class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors"
            >รายการของฉัน</RouterLink
          >

          <button
            @click="handleLogout"
            class="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-bold hover:bg-red-100 hover:text-red-600 transition-all border border-gray-200 text-sm"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
