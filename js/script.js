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

const userData = localStorage.getItem("twitchUser");
if (userData) {
  const { name, avatar } = JSON.parse(userData);
  document.getElementById("userAvatar").src = avatar;
  document.getElementById("userName").textContent = name;
  document.getElementById("userInfo").classList.remove("hidden");
}
