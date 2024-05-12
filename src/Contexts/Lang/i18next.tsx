import { initReactI18next } from "react-i18next";
import i18next from "i18next";
import global_es from "./es/global.json";
import global_en from "./en/global.json";
import footer_en from "./en/footer.json";
import footer_es from "./es/footer.json";
import dashboard_en from "./en/dashboard.json";
import dashboard_es from "./es/dashboard.json";
import landing_en from "./en/landing.json";
import landing_es from "./es/landing.json";
import login_en from "./en/login.json";
import login_es from "./es/login.json";
import signup_en from "./en/signup.json";
import signup_es from "./es/signup.json";
/**
 * The `i18next` instance configuration.
 * Specifies the escape value option, compatibility version, default language, fallback language,
 * and the actual language resource to use.
 */
i18next.use(initReactI18next).init({
  interpolation: {
    escapeValue: false,
  }, // React already does escaping
  compatibilityJSON: "v3",
  lng: "es",
  fallbackLng: "es",
  resources: {
    es: {
      global: global_es,
      footer: footer_es,
      dashboard: dashboard_es,
      landing: landing_es,
      login: login_es,
      signup: signup_es,
    },
    en: {
      global: global_en,
      footer: footer_en,
      dashboard: dashboard_en,
      landing: landing_en,
      login: login_en,
      signup: signup_en,
    },
  },
});

export { i18next };
