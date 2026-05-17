// 🌙✨ translate.js – Astra & Commander 🩶
// Zentrale Sprachsteuerung mit automatischer Erkennung & Modul-Verbindung

document.addEventListener("DOMContentLoaded", () => {
  const supportedLangs = ["de", "en", "fr", "es"];
  let currentLang = "de";

  // 🔵 Sprache aus localStorage oder Browser ermitteln
  try {
    const savedLang = localStorage.getItem("lang");
    const browserLang = navigator.language ? navigator.language.substring(0, 2) : null;

    if (savedLang && supportedLangs.includes(savedLang)) {
      currentLang = savedLang;
    } else if (browserLang && supportedLangs.includes(browserLang)) {
      currentLang = browserLang;
    }
  } catch (e) {
    console.warn("⚠️ Sprachspeicher konnte nicht gelesen werden:", e);
  }

  // Zusätzliche Übersetzungen laden
  loadExtraTranslations();
  applyTranslations();

  // 🌍 Sprachumschalter
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  const langFlag = document.getElementById("langFlag");

  if (langBtn && langMenu) {
    // Menü öffnen / schließen
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
    });

    // Auswahl einer Sprache
    langMenu.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        const selectedLang = item.dataset.lang;
        const selectedFlag = item.dataset.flag;
        if (supportedLangs.includes(selectedLang)) {
          try {
            localStorage.setItem("lang", selectedLang);
          } catch (e) {
            console.warn("⚠️ Sprache konnte nicht gespeichert werden:", e);
          }
          currentLang = selectedLang;
          if (langFlag) langFlag.src = selectedFlag;
          applyTranslations();
        }
        langMenu.classList.add("hidden");
      });
    });

    // Klick außerhalb schließt Menü
    document.addEventListener("click", (e) => {
      if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add("hidden");
      }
    });
  }

  // 🩵 Übersetzungen anwenden
  function applyTranslations() {
    const elements = document.querySelectorAll("[data-key]");

    elements.forEach((el) => {
      const key = el.getAttribute("data-key");

      const text =
        translations[currentLang]?.[key] ||
        (typeof dashboardTranslations !== "undefined"
          ? dashboardTranslations[currentLang]?.[key]
          : null) ||
        (typeof privacyTranslations !== "undefined"
          ? privacyTranslations[currentLang]?.[key]
          : null) ||
        (typeof logTranslations !== "undefined"
          ? logTranslations[currentLang]?.[key]
          : null) ||
        key;

      if (text) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    console.log(`🌍 Sprache aktiv: ${currentLang.toUpperCase()}`);
  }

  // 🔵 Zusätzliche Übersetzungsdateien automatisch laden
  function loadExtraTranslations() {
    const extraFiles = [
      "dashboard_translations.js",
      "privacy_translations.js",
      "log_translations.js"
    ];

    extraFiles.forEach((file) => {
      const script = document.createElement("script");
      script.src = "js/" + file;
      script.onload = () => console.log(`[Loaded] ${file}`);
      document.head.appendChild(script);
    });
  }
});

// ⚪ Grundübersetzungen – global gültige Begriffe
const translations = {
  de: {
    langName: "Deutsch",
    switchLang: "Sprache ändern",
    welcome: "Willkommen zurück, Commander",
    settings: "Einstellungen"
  },
  en: {
    langName: "English",
    switchLang: "Change language",
    welcome: "Welcome back, Commander",
    settings: "Settings"
  },
  fr: {
    langName: "Français",
    switchLang: "Changer de langue",
    welcome: "Bon retour, Commandant",
    settings: "Paramètres"
  },
  es: {
    langName: "Español",
    switchLang: "Cambiar idioma",
    welcome: "Bienvenido de nuevo, Comandante",
    settings: "Configuraciones"
  }
};
