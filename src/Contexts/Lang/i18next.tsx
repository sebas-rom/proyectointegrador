import { initReactI18next } from "react-i18next";
import i18next from "i18next";
import global_es from "./es/global.json";
import global_en from "./en/global.json";

/**
 * The `i18next` instance configuration.
 * Specifies the escape value option, compatibility version, default language, fallback language,
 * and the actual language resource to use.
 */
i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false }, // React already does escaping
  compatibilityJSON: "v3",
  lng: "es",
  fallbackLng: "es",
  resources: {
    es: {
      global: global_es,
    },
    en: {
      global: global_en,
    },
  },
});

export { i18next };
