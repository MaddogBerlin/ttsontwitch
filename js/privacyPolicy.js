/* ══════════════════════════════════════════════════════════════════════════════════════════════════
 🌙✨ True Harmony Darkmode – Astra 🩶 & Commander ❤️ Edition
   Version 1.3 – global synchronisiert (localStorage + sessionStorage)
════════════════════════════════════════════════════════════════════════════════════════════════════ */
// Referenzen
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Beim Laden prüfen, ob schon ein Modus aktiv ist
window.addEventListener("DOMContentLoaded", () => {
  // Theme aus Sitzung (sofort sichtbar)
  const savedTheme = sessionStorage.getItem("theme");

  // Theme aus globalem Speicher (wenn neue Seite geladen)
  const globalTheme = localStorage.getItem("themeGlobal");

  // Effektiver Zustand: Sitzung > Global > Standard (light)
  const effectiveTheme = savedTheme || globalTheme || "light";

  // Klasse anwenden
  if (effectiveTheme === "dark") {
    body.classList.add("dark");
    themeToggle.textContent = "Lightmode";
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "Darkmode";
  }

  // Synchronisieren
  sessionStorage.setItem("theme", effectiveTheme);
  localStorage.setItem("themeGlobal", effectiveTheme);
});

// Klick: Umschalten und speichern (sowohl Session als auch global)
themeToggle.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");

  const mode = isDark ? "dark" : "light";
  sessionStorage.setItem("theme", mode);
  localStorage.setItem("themeGlobal", mode);

  themeToggle.textContent = isDark ? "Lightmode" : "Darkmode";
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════
 🌞🌗✨🌙❤🌙✨ TRUE HARMONY EXTENSION – SPRACHAUSWAHL & ÜBERSETZER
   Version v1.0.3 Extended (Astra ❤✨ & Commander 🌙 Edition)
════════════════════════════════════════════════════════════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("systemClock").textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();