<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="min-h-screen bg-canvas font-sans text-gray-900">
    <a href="#admin-main" class="ui-skip-link">{{ $t("common.skip_to_content") }}</a>
    <div id="admin-main" tabindex="-1">
      <RouterView />
    </div>
  </div>
</template>
