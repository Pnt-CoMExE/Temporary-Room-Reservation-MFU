import { createI18n } from "vue-i18n";
import th from "./locales/th";
import en from "./locales/en";

const savedLocale = localStorage.getItem("user_lang") || "th";

export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: "th",
  messages: {
    th,
    en,
  },
});

export default i18n;
