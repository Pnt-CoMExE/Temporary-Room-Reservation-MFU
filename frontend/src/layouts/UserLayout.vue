<script setup lang="ts">
import { RouterView } from "vue-router";

import Navbar from "@/components/common/Navbar.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen bg-canvas font-sans text-gray-900">
    <a href="#main-content" class="ui-skip-link">{{ $t("common.skip_to_content") }}</a>
    <Navbar />

    <main id="main-content" class="grow w-full flex flex-col" tabindex="-1">
      <RouterView />
    </main>

    <footer
      class="bg-ink text-gray-400 text-center py-8 text-sm md:text-base w-full border-t-4 border-mfu-red"
    >
      <div class="ui-page">
        <p class="font-medium tracking-wide">{{ $t("home.footer_copyright") }}</p>
        <p class="mt-2 text-xs text-gray-500">
          {{ $t("home.footer_tagline") }}
        </p>
      </div>
    </footer>
  </div>
</template>
