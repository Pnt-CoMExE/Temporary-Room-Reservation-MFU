<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center max-w-md">
      <!-- Error code -->
      <h1 class="text-9xl font-black text-[#ba0b2f] tracking-tight">404</h1>

      <!-- Divider -->
      <div class="w-16 h-1 bg-[#ba0b2f] mx-auto my-6 rounded-full"></div>

      <!-- Message -->
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        ไม่พบหน้าที่คุณค้นหา
      </h2>
      <p class="text-gray-500 mb-8 leading-relaxed">
        หน้าที่คุณกำลังมองหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ชั่วคราว
      </p>

      <!-- Back button -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <router-link
          to="/home"
          class="px-6 py-3 bg-[#ba0b2f] text-white rounded-xl font-medium hover:bg-[#980926] transition-colors shadow-lg shadow-[#ba0b2f]/25"
        >
          ← กลับหน้าหลัก
        </router-link>
        <button
          @click="$router.back()"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  </div>
</template>
