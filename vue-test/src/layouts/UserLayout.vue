<script setup>
import { RouterView } from "vue-router";
// เช็คให้แน่ใจว่า import Navbar ถูกตำแหน่ง (โฟลเดอร์ components/common)
import Navbar from "@/components/common/Navbar.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
    <Navbar />

    <main class="grow w-full flex flex-col">
      <RouterView />
    </main>

    <footer
      class="bg-[#111827] text-gray-400 text-center py-6 text-sm w-full border-t-4 border-[#ba0b2f]"
    >
      &copy; 2026 ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง.
      <br class="sm:hidden" />All rights reserved.
    </footer>
  </div>
</template>
