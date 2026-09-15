<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();

const pageKey = computed(() => String(route.params.page || "manual"));

const title = computed(() => {
  const key = `info.${pageKey.value}_title`;
  return te(key) ? t(key) : t("info.manual_title");
});

const body = computed(() => {
  const key = `info.${pageKey.value}_body`;
  return te(key) ? t(key) : t("info.manual_body");
});
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <button
        type="button"
        class="text-sm font-bold text-[#ba0b2f] mb-6 hover:underline cursor-pointer"
        @click="router.push('/home')"
      >
        ← {{ $t("info.back_home") }}
      </button>
      <article class="bg-white rounded-3xl border border-gray-200 shadow-card p-8 md:p-10">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
          {{ title }}
        </h1>
        <div class="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
          {{ body }}
        </div>
      </article>
    </div>
  </div>
</template>
