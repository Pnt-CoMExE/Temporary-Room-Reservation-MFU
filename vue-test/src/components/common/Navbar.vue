<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2"; // ✨ เพิ่ม SweetAlert2

const router = useRouter();
const isMenuOpen = ref(false);

const closeMenu = () => {
  isMenuOpen.value = false;
};

// ✨ ฟังก์ชัน Logout แบบ SweetAlert2
const confirmLogout = () => {
  // สำหรับ Navbar อย่าลืมใส่: isMenuOpen.value = false; ไว้บรรทัดแรกด้วยนะครับ
  Swal.fire({
    html: `
      <div class="relative w-24 h-24 mx-auto mb-6">
        <!-- เอฟเฟกต์วงแหวนกระเพื่อมด้านหลัง (Pulse effect) -->
        <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
        <!-- วงกลมไอคอนหลัก -->
        <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border-[4px] border-red-50 text-[#ba0b2f] text-4xl">
          <i class="fas fa-sign-out-alt ml-1 translate-x-0.5"></i>
        </div>
      </div>
      <h3 class="text-2xl font-black text-gray-900 tracking-tight mb-2">
        ออกจากระบบ?
      </h3>
      <p class="text-sm text-gray-500 font-medium px-2">
        คุณต้องการออกจากระบบการจัดการพื้นที่ใช่หรือไม่?
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: "ออกจากระบบ",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-sm border border-gray-100 shadow-2xl", // ขอบโค้งมนแบบพรีเมียม
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      // ปุ่มออกจากระบบ: ใช้สีไล่ระดับ Gradient, มีเงาสีแดงตกกระทบ, ขยับขึ้นเวลานำเมาส์ชี้
      confirmButton:
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
      // ปุ่มยกเลิก: สไตล์มินิมอล นุ่มนวล ดูไม่แย่งความสนใจ
      cancelButton:
        "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      router.push("/");
    }
  });
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
              หน้าแรก<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/rooms"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              จองห้องพัก<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              รายการของฉัน<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>

            <!-- ✨ ปุ่ม Logout ฝั่ง Desktop -->
            <button
              @click="confirmLogout"
              class="group bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-[#ba0b2f] transition-all duration-300 border border-gray-200 hover:border-red-100 text-sm flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
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
              class="text-gray-600 hover:text-[#ba0b2f] focus:outline-none p-2 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <i v-if="!isMenuOpen" class="fas fa-bars text-lg"></i>
              <i v-else class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- เมนูมือถือ -->
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
            <!-- ✨ ปุ่ม Logout ฝั่ง Mobile -->
            <button
              @click="confirmLogout"
              class="w-full bg-linear-to-r from-[#ba0b2f] to-[#8c0823] text-white py-4 rounded-xl font-bold shadow-md shadow-red-200 flex justify-center items-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
