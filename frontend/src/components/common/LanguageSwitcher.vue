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
  <div class="inline-flex items-center bg-gray-100/90 p-1 rounded-full border border-gray-200 shadow-inner">
    <button
      @click="setLanguage('th')"
      type="button"
      class="px-3.5 py-1 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer"
      :class="
        currentLang === 'th'
          ? 'bg-white text-[#ba0b2f] shadow-md shadow-red-100 scale-105'
          : 'text-gray-500 hover:text-gray-900'
      "
    >
      TH
    </button>

    <button
      @click="setLanguage('en')"
      type="button"
      class="px-3.5 py-1 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer"
      :class="
        currentLang === 'en'
          ? 'bg-white text-[#ba0b2f] shadow-md shadow-red-100 scale-105'
          : 'text-gray-500 hover:text-gray-900'
      "
    >
      EN
    </button>
  </div>
</template>
