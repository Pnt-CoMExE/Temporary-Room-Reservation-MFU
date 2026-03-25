<script setup>
import { ref } from "vue"; // เพิ่ม ref เข้ามาเพื่อคุมสถานะเปิด/ปิด
import { useRouter } from "vue-router";
const router = useRouter();

// สร้างตัวแปรมาเก็บสถานะว่าเมนูปมือกือเปิดอยู่ไหม
const isMenuOpen = ref(false);

const handleLogout = () => {
  if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    router.push("/");
  }
};

// ฟังก์ชันปิดเมนูเวลาเรากดเปลี่ยนหน้า
const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <div class="flex items-center">
          <RouterLink to="/home" class="flex items-center group">
            <div class="flex flex-col">
              <span class="text-xl font-bold text-[#ba0b2f] leading-none">MFU</span>
              <span class="text-sm font-semibold text-[#d4af37] tracking-wider">PROPERTY</span>
            </div>
          </RouterLink>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <RouterLink to="/home" class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors">หน้าแรก</RouterLink>
          <RouterLink to="/rooms" class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors">จองห้องพัก</RouterLink>
          <RouterLink to="/dashboard" class="text-gray-600 hover:text-[#ba0b2f] font-medium transition-colors">รายการของฉัน</RouterLink>
          <button @click="handleLogout" class="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-bold hover:bg-red-100 hover:text-red-600 transition-all border border-gray-200 text-sm">
            ออกจากระบบ
          </button>
        </div>

        <div class="flex md:hidden items-center">
          <button @click="isMenuOpen = !isMenuOpen" class="text-gray-600 hover:text-[#ba0b2f] focus:outline-none p-2">
            <i v-if="!isMenuOpen" class="fas fa-bars text-2xl"></i>
            <i v-else class="fas fa-times text-2xl"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isMenuOpen" class="md:hidden bg-white border-b border-gray-100 shadow-lg animate-fade-down animate-duration-300">
      <div class="px-4 pt-2 pb-6 space-y-1">
        <RouterLink to="/home" @click="closeMenu" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">หน้าแรก</RouterLink>
        <RouterLink to="/rooms" @click="closeMenu" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">จองห้องพัก</RouterLink>
        <RouterLink to="/dashboard" @click="closeMenu" class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">รายการของฉัน</RouterLink>
        <div class="pt-4 border-t border-gray-100 mt-2">
          <button @click="handleLogout" class="w-full bg-[#ba0b2f] text-white py-3 rounded-xl font-bold shadow-md">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>