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
    <div class="ui-page py-16 max-w-3xl">
      <button type="button" class="ui-btn-ghost mb-6 px-0" @click="router.push('/home')">
        ← {{ $t("info.back_home") }}
      </button>
      <article class="ui-card-elevated p-8 md:p-10">
        <h1 class="ui-section-title mb-6">
          {{ title }}
        </h1>
        <div class="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
          {{ body }}
        </div>
      </article>
    </div>
  </div>
</template>
