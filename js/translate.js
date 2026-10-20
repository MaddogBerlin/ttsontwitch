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

    const deleteTooltip =
      dashboardTranslations[lang]?.ttsViewerVoiceDelete ||
      dashboardTranslations.de.ttsViewerVoiceDelete;

    document.querySelectorAll(".tts-user-voice-delete").forEach(button => {
      const name = button.closest(".tts-user-voice-entry")
        ?.querySelector(".tts-user-voice-name")?.textContent;

      button.title = deleteTooltip;
      button.setAttribute("aria-label", `${deleteTooltip}: ${name || ""}`);
    });

    // Platzhalter der Zuschauer-Stimmenauswahl aktualisieren
    const viewerVoiceSelect = document.getElementById("ttsViewerVoice");
    const defaultOption = viewerVoiceSelect?.querySelector('option[value=""]');

    if (defaultOption) {
      defaultOption.textContent =
        dashboardTranslations[lang]?.ttsViewerVoicePlaceholder ||
        dashboardTranslations.de.ttsViewerVoicePlaceholder;
    }
  });
});

// 🔹 Optional: Sprachcode in Konsole anzeigen (Debug)
console.log(`🌐 Aktive Sprache: ${currentLang}`);
