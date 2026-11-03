<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-canvas px-4">
    <div class="text-center max-w-md ui-card-elevated p-8 sm:p-10">
      <p class="text-sm font-black tracking-[0.2em] text-mfu-gold uppercase mb-2">
        {{ $t("not_found.code") }}
      </p>
      <h1 class="text-8xl sm:text-9xl font-black text-mfu-red tracking-tight leading-none">
        404
      </h1>

      <div class="w-16 h-1 bg-mfu-red mx-auto my-6 rounded-full"></div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        {{ $t("not_found.title") }}
      </h2>
      <p class="ui-muted mb-8 leading-relaxed">
        {{ $t("not_found.desc") }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/home" class="ui-btn-primary">
          ← {{ $t("not_found.back_home") }}
        </router-link>
        <button type="button" class="ui-btn-secondary" @click="router.back()">
          {{ $t("not_found.go_back") }}
        </button>
      </div>
    </div>
  </div>
</template>
