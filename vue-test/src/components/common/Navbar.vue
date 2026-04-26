<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const isMenuOpen = ref(false);
const showLogoutModal = ref(false);

const handleLogoutClick = () => {
  isMenuOpen.value = false;
  showLogoutModal.value = true;
};

const confirmLogout = () => {
  showLogoutModal.value = false;
  localStorage.clear();
  router.push("/");
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <div>
    <nav
      class="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <RouterLink to="/home" class="flex items-center group">
              <div
                class="flex flex-col transform group-hover:scale-105 transition-transform duration-300"
              >
                <span
                  class="text-2xl font-extrabold text-[#ba0b2f] leading-none tracking-tight"
                  >MFU</span
                >
                <span
                  class="text-[10px] font-bold text-[#d4af37] tracking-[0.2em] mt-0.5"
                  >PROPERTY</span
                >
              </div>
            </RouterLink>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <RouterLink
              to="/home"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              หน้าแรก
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/rooms"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              จองห้องพัก
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              รายการของฉัน
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>

            <button
              @click="handleLogoutClick"
              class="group bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-[#ba0b2f] transition-all duration-300 border border-gray-200 hover:border-red-100 text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <i
                class="fas fa-sign-out-alt text-gray-400 group-hover:text-[#ba0b2f] transition-colors"
              ></i>
              ออกจากระบบ
            </button>
          </div>

          <div class="flex md:hidden items-center">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="text-gray-600 hover:text-[#ba0b2f] focus:outline-none p-2 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center transition-colors"
            >
              <i v-if="!isMenuOpen" class="fas fa-bars text-lg"></i>
              <i v-else class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="isMenuOpen"
        class="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl absolute w-full left-0 animate-fade-down"
      >
        <div class="px-4 pt-4 pb-6 space-y-2">
          <RouterLink
            to="/home"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >หน้าแรก</RouterLink
          >
          <RouterLink
            to="/rooms"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >จองห้องพัก</RouterLink
          >
          <RouterLink
            to="/dashboard"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >รายการของฉัน</RouterLink
          >
          <div class="pt-4 border-t border-gray-100 mt-2">
            <button
              @click="handleLogoutClick"
              class="w-full bg-linear-to-r from-[#ba0b2f] to-[#8c0823] text-white py-4 rounded-xl font-bold shadow-md shadow-red-200 flex justify-center items-center gap-2 active:scale-95 transition-transform"
            >
              <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
    >
      <div
        class="bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl text-center animate-fade-up relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-red-500 to-[#ba0b2f]"
        ></div>

        <div
          class="w-24 h-24 rounded-full bg-red-50 text-[#ba0b2f] mx-auto mb-6 flex items-center justify-center text-4xl shadow-inner border-[6px] border-white ring-1 ring-red-100 transform transition-transform hover:scale-110 duration-300"
        >
          <i class="fas fa-sign-out-alt ml-1"></i>
        </div>

        <h3 class="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
          ออกจากระบบ?
        </h3>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
          คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?<br />คุณจะต้องเข้าสู่ระบบใหม่ในครั้งถัดไป
        </p>

        <div class="flex gap-4">
          <button
            @click="showLogoutModal = false"
            class="flex-1 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all text-sm uppercase tracking-wider"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmLogout"
            class="flex-1 py-4 bg-linear-to-r from-[#ba0b2f] to-[#8c0823] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-red-200/50 transform hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
