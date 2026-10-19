// 🌙✨ True Harmony Darkmode mit Session-Gedächtnis
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Beim Laden prüfen, ob Session bereits einen Modus gesetzt hat
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = sessionStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark");
    themeToggle.textContent = "Lightmode";
  } else {
    themeToggle.textContent = "Darkmode";
  }
});

// Klick: Wechseln & in der aktuellen Sitzung speichern
themeToggle.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");
  sessionStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Lightmode" : "Darkmode";
});

// 🕒 Lokale Systemzeit im Footer anzeigen
function updateClock() {
  const clock = document.getElementById("systemClock");
  if (!clock) return;

  clock.textContent = new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

updateClock();
setInterval(updateClock, 1000);

