// 🌙✨ translate.js – Astra & Commander Edition
// Diese Datei steuert die Sprachumschaltung und synchronisiert
// die Texte mit den Übersetzungen aus dashboard_translations.js.

// 🔹 Übersetzung anwenden
function applyTranslations(lang, source = dashboardTranslations) {
  const elements = document.querySelectorAll("[data-key]");
  elements.forEach(el => {
    const key = el.getAttribute("data-key");
    const translation = source?.[lang]?.[key];
    if (translation) {
      el.innerHTML = translation;
    }
  });
}

// 🔹 Sprache aus localStorage laden (oder Standard: Deutsch)
const currentLang = localStorage.getItem("lang") || "de";
applyTranslations(currentLang);

// 🔹 Sprachumschalter aktivieren
document.querySelectorAll("[data-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    localStorage.setItem("lang", lang);
    applyTranslations(lang);
  });
});

// 🔹 Optional: Sprachcode in Konsole anzeigen (Debug)
console.log(`🌐 Aktive Sprache: ${currentLang}`);
