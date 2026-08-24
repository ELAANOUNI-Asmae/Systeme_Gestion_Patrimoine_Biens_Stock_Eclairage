import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr";
import ar from "./locales/ar";

const savedLanguage =
  localStorage.getItem("sgpbse-language") === "ar"
    ? "ar"
    : "fr";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: fr,
      },

      ar: {
        translation: ar,
      },
    },

    lng: savedLanguage,
    fallbackLng: "fr",

    supportedLngs: [
      "fr",
      "ar",
    ],

    interpolation: {
      escapeValue: false,
    },

    returnNull: false,
  });

const applyLanguageSettings = (
  language: string,
) => {
  const normalizedLanguage =
    language.startsWith("ar")
      ? "ar"
      : "fr";

  document.documentElement.lang =
    normalizedLanguage;

  document.documentElement.dir =
    normalizedLanguage === "ar"
      ? "rtl"
      : "ltr";

  localStorage.setItem(
    "sgpbse-language",
    normalizedLanguage,
  );
};

applyLanguageSettings(savedLanguage);

i18n.on(
  "languageChanged",
  applyLanguageSettings,
);

export default i18n;