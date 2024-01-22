import { i18next } from "./i18next";
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
