<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

// สร้างตัวแปรมาเก็บสถานะว่าเมนูมือถือเปิดอยู่ไหม
const isMenuOpen = ref(false);

// 1. เพิ่มตัวแปรคุมป๊อปอัปออกจากระบบ
const showLogoutModal = ref(false);

// 2. ฟังก์ชันเมื่อกดปุ่มออกจากระบบ
const handleLogoutClick = () => {
  isMenuOpen.value = false; // ปิดเมนูมือถือ (ถ้าเปิดอยู่)
  showLogoutModal.value = true; // โชว์ป๊อปอัป
};

// 3. ฟังก์ชันกดยืนยันการออกจากระบบ
const confirmLogout = () => {
  showLogoutModal.value = false;
  localStorage.clear(); // เคลียร์ข้อมูลทั้งหมดให้สะอาดหมดจด
  router.push("/"); // เด้งไปหน้าแรก
};

// ฟังก์ชันปิดเมนูเวลาเรากดเปลี่ยนหน้า
const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <!-- ต้องมี div ครอบทั้งหมดไว้ 1 ชั้น (สำหรับ Vue 3 Fragments + Z-index ป๊อปอัป) -->
  <div>
    <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <!-- โลโก้ -->
          <div class="flex items-center">
            <RouterLink to="/home" class="flex items-center group">
              <div class="flex flex-col">
                <span class="text-xl font-bold text-[#ba0b2f] leading-none"
                  >MFU</span
                >
                <span
                  class="text-sm font-semibold text-[#d4af37] tracking-wider"
                  >PROPERTY</span
                >
              </div>
            </RouterLink>
          </div>

          <!-- เมนู Desktop -->
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

            <!-- เปลี่ยน @click มาเรียก handleLogoutClick -->
            <button
              @click="handleLogoutClick"
              class="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-bold hover:bg-red-100 hover:text-red-600 transition-all border border-gray-200 text-sm flex items-center gap-2"
            >
              <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
            </button>
          </div>

          <!-- ปุ่มแฮมเบอร์เกอร์ (มือถือ) -->
          <div class="flex md:hidden items-center">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="text-gray-600 hover:text-[#ba0b2f] focus:outline-none p-2"
            >
              <i v-if="!isMenuOpen" class="fas fa-bars text-2xl"></i>
              <i v-else class="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- เมนู Mobile -->
      <div
        v-if="isMenuOpen"
        class="md:hidden bg-white border-b border-gray-100 shadow-lg animate-fade-down animate-duration-300"
      >
        <div class="px-4 pt-2 pb-6 space-y-1">
          <RouterLink
            to="/home"
            @click="closeMenu"
            class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >หน้าแรก</RouterLink
          >
          <RouterLink
            to="/rooms"
            @click="closeMenu"
            class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >จองห้องพัก</RouterLink
          >
          <RouterLink
            to="/dashboard"
            @click="closeMenu"
            class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >รายการของฉัน</RouterLink
          >
          <div class="pt-4 border-t border-gray-100 mt-2">
            <!-- เปลี่ยน @click มาเรียก handleLogoutClick -->
            <button
              @click="handleLogoutClick"
              class="w-full bg-[#ba0b2f] text-white py-3 rounded-xl font-bold shadow-md flex justify-center items-center gap-2"
            >
              <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- ========================================== -->
    <!-- 🔴 Modal ยืนยันการออกจากระบบ (Tailwind) -->
    <!-- ========================================== -->
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity px-4"
    >
      <div
        class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all text-center"
      >
        <!-- ไอคอนประตูออก -->
        <div
          class="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-[#ba0b2f] mx-auto mb-4 text-3xl shadow-inner"
        >
          <i class="fas fa-sign-out-alt"></i>
        </div>

        <h3 class="text-2xl font-bold text-gray-900 mb-2">ออกจากระบบ?</h3>
        <p class="text-sm text-gray-500 mb-6 leading-relaxed">
          คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีนี้?
        </p>

        <!-- ปุ่มกดยกเลิก / ยืนยัน -->
        <div class="flex gap-3">
          <button
            @click="showLogoutModal = false"
            class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmLogout"
            class="flex-1 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-md shadow-red-200"
          >
            ใช่, ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
