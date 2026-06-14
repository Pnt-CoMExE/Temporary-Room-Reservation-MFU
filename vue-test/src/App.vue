<script setup lang="ts">
import { RouterView } from "vue-router";
import ToastContainer from "@/components/common/ToastContainer.vue";
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>

<style>
/* Reset พื้นฐาน */
body {
  margin: 0;
  padding: 0;
}
</style>
