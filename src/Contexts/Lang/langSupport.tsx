import { i18next } from "./i18next";

/**
 * Initializes the language settings for the application based on the user's preferences or defaults.
 * - It first checks the user's browser language against the supported languages array.
 * - If the user's preferred language is supported, it sets that as the saved language.
 * - Otherwise, it defaults to English ("en").
 * - The function also checks the local storage for a saved language preference.
 * - Lastly, it sets the language in both `i18next` and the local storage.
 */
export function initLang() {
  const supportedLanguages = ["en", "es"];
  const userLanguage = navigator.language;
  let savedLanguage = "en"; // Default language

  if (
    userLanguage !== "" &&
    userLanguage !== null &&
    supportedLanguages.includes(userLanguage)
  ) {
    savedLanguage = userLanguage;
  }

  if (typeof window !== "undefined") {
    savedLanguage = localStorage.getItem("language") || savedLanguage; // Use default if not found
    i18next.changeLanguage(savedLanguage);
    localStorage.setItem("language", savedLanguage);
  }
}
