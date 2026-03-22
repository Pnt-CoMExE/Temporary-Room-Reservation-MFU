<script setup>
import { RouterView, useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";

const route = useRoute();
</script>

<template>
  <div class="font-sans text-gray-900">
    <Navbar v-if="route.name !== 'login'" />

    <RouterView />

    <footer class="bg-gray-800 text-white text-center py-4 text-sm mt-auto">
      &copy; 2026 ระบบบริหารจัดการพื้นที่เช้าชั่วคราวของมหาวิทยาลัยแม่ฟ้าหลวง.
      All rights reserved.
    </footer>
  </div>
</template>
