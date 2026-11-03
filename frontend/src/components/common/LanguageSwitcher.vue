<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const currentLang = computed(() => locale.value);

const setLanguage = (lang: "th" | "en") => {
  locale.value = lang;
  localStorage.setItem("user_lang", lang);
};
</script>

<template>
  <div
    class="inline-flex items-center bg-gray-100/90 p-1 rounded-full border border-gray-200 shadow-inner"
    role="group"
    aria-label="Language"
  >
    <button
      type="button"
      @click="setLanguage('th')"
      class="px-3.5 py-1.5 rounded-full text-sm font-black tracking-wider transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mfu-red/40"
      :class="
        currentLang === 'th'
          ? 'bg-white text-mfu-red shadow-md shadow-red-100 scale-105'
          : 'text-gray-500 hover:text-gray-900'
      "
      :aria-pressed="currentLang === 'th'"
    >
      TH
    </button>

    <button
      type="button"
      @click="setLanguage('en')"
      class="px-3.5 py-1.5 rounded-full text-sm font-black tracking-wider transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mfu-red/40"
      :class="
        currentLang === 'en'
          ? 'bg-white text-mfu-red shadow-md shadow-red-100 scale-105'
          : 'text-gray-500 hover:text-gray-900'
      "
      :aria-pressed="currentLang === 'en'"
    >
      EN
    </button>
  </div>
</template>
