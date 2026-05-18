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

/* ══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌙✨ Twitch OAuth Login – True Harmony Integration
 🌙✨ TRUE HARMONY – TWITCH LOGIN STATUS & PROFILANZEIGE
   Version v1.0.3 Extended (Astra 🩶 & Commander ❤️ Edition)
════════════════════════════════════════════════════════════════════════════════════════════════════ */
const clientId = "yuol0okiv6jnik7kv000jdizlswyq6"; // <– trage hier deine Twitch Client-ID ein
const redirectUri = "https://ttsontwitch.de/dashboard.html";
const scope = "user:read:email chat:read chat:edit"; // kann bei Bedarf erweitert werden, z. B. chat:read chat:edit

// Funktion: Startet den Twitch-Login-Flow
document.getElementById("connectBtn").addEventListener("click", () => {
  const authUrl =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(scope)}`;

  // Weiterleitung zu Twitch Login
  window.location.href = authUrl;
});

// Funktion: Prüft beim Laden, ob ein Access-Token vorhanden ist
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const statusBtn = document.getElementById("loginStatus");
  const connectBtn = document.getElementById("connectBtn");
  const log = document.getElementById("ttsLog");

  if (accessToken) {
    // optional speichern
    localStorage.removeItem("twitchToken");

    // Token-Parameter aus URL entfernen
    window.history.replaceState({}, document.title, window.location.pathname);

    // Benutzerinfos abrufen
    fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Client-Id": clientId
      }
    })
      .then(res => res.json())
      .then(data => {
        const user = data.data?.[0];
        if (user) {
          // Protokollmeldung
          if (log) {
            const entry = document.createElement("div");
            entry.textContent = `[${new Date().toLocaleTimeString()}] Eingeloggt als ${user.display_name}`;
            log.appendChild(entry);
          }

          // Header-Button aktualisieren
          statusBtn.textContent = `Eingeloggt als ${user.display_name}`;
          statusBtn.classList.remove("disconnected");
          statusBtn.classList.add("connected");

          // "Verbinden"-Button deaktivieren
          connectBtn.textContent = "Verbunden ✓";
          connectBtn.disabled = true;
          connectBtn.classList.add("connected");

          // Profilbild im Header anzeigen
          const img = document.createElement("img");
          img.src = user.profile_image_url;
          img.alt = user.display_name;
          img.style.height = "26px";
          img.style.borderRadius = "50%";
          img.style.marginLeft = "8px";
          statusBtn.after(img);
        }
      })
      .catch(err => {
        console.error("Twitch API Fehler:", err);
        if (log) {
          const entry = document.createElement("div");
          entry.textContent = `[${new Date().toLocaleTimeString()}] Twitch API Fehler: ${err.message}`;
          log.appendChild(entry);
        }
      });
  } else {
    // Kein Token → Status auf "nicht eingeloggt"
    statusBtn.textContent = "Nicht eingeloggt";
    statusBtn.classList.add("disconnected");
  }
});

// Klick: Wechseln & in der aktuellen Sitzung speichern
themeToggle.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");
  sessionStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Lightmode" : "Darkmode";
});

function toggleSection(toggleId,targetId){
  const t=document.getElementById(toggleId),el=document.getElementById(targetId);
  t.addEventListener("change",()=>el.classList.toggle("active",t.checked));
}
toggleSection("ttsToggle","ttsOptions");
toggleSection("toggleTTSFilter","filterGroup");

const logArea=document.getElementById("ttsLog");
function appendLog(msg){
  const entry=document.createElement("div");
  entry.textContent=`[${new Date().toLocaleTimeString()}] ${msg}`;
  logArea.appendChild(entry);
  logArea.scrollTop=logArea.scrollHeight;
}
document.getElementById("ttsToggle").addEventListener("change",e=>appendLog(e.target.checked?"TTS aktiviert.":"TTS deaktiviert."));
document.getElementById("toggleTTSFilter").addEventListener("change",e=>appendLog(e.target.checked?"TTS aktiviert.":"TTS deaktiviert."));
document.getElementById("rate").addEventListener("input",e=>{
  document.getElementById("rateValue").textContent=e.target.value+"×";
});
document.getElementById("volume").addEventListener("input",e=>{
  document.getElementById("volumeValue").textContent=Math.round(e.target.value*100)+" %";
});
document.getElementById("speakBtn").addEventListener("click",()=>{
  const text=document.getElementById("testText").value.trim();
  appendLog(text?`Gesprochen: "${text}"`:"Keine Eingabe erkannt.");
});

// 🎧 Mini Equalizer – Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const eqFilters = {
  bass: audioCtx.createBiquadFilter(),
  mid: audioCtx.createBiquadFilter(),
  treble: audioCtx.createBiquadFilter()
};

// Filtertypen & Frequenzen
eqFilters.bass.type = "lowshelf";
eqFilters.bass.frequency.value = 200;
eqFilters.mid.type = "peaking";
eqFilters.mid.frequency.value = 1000;
eqFilters.treble.type = "highshelf";
eqFilters.treble.frequency.value = 3000;

// Filter verketten
eqFilters.bass.connect(eqFilters.mid);
eqFilters.mid.connect(eqFilters.treble);
eqFilters.treble.connect(audioCtx.destination);

// Listener an Regler
document.getElementById("bassControl").addEventListener("input", e => {
  eqFilters.bass.gain.value = e.target.value;
});
document.getElementById("midControl").addEventListener("input", e => {
  eqFilters.mid.gain.value = e.target.value;
});
document.getElementById("trebleControl").addEventListener("input", e => {
  eqFilters.treble.gain.value = e.target.value;
});
// 🌙✨ Sprachfunktion – Astra & Commander Harmonischer Codefluss
const synth = window.speechSynthesis;
let voices = [];

function populateVoices() {
  voices = synth.getVoices();
  const voiceSelect = document.getElementById("voice");
  voiceSelect.innerHTML = "";

  voices.forEach((v) => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(option);
  });
}

// Stimmen laden, sobald sie bereitstehen
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

document.getElementById("speakBtn").addEventListener("click", () => {
  const text = document.getElementById("testText").value.trim();
  if (!text) {
    appendLog("Keine Eingabe erkannt.");
    return;
  }

  // vorhandene Sprache abbrechen, falls aktiv
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const selectedVoiceName = document.getElementById("voice").value;
  const selectedVoice = voices.find((v) => v.name === selectedVoiceName);
  if (selectedVoice) utter.voice = selectedVoice;

  utter.rate = parseFloat(document.getElementById("rate").value);
  utter.volume = parseFloat(document.getElementById("volume").value);
  utter.onstart = () => appendLog(`🎤 "${text}" wird gesprochen...`);
  document.getElementById("speakBtn").classList.add("speaking");
  utter.onend = () => appendLog(`✅ Ausgabe beendet.`);
  document.getElementById("speakBtn").classList.remove("speaking");

  synth.speak(utter);
});

  // ═══ Erweiterung: Protokollierung der Filter-Aktionen ═══
  // ═══ 💫 Erweiterte TTS-Filter-Matrix-Protokollierung ═══
document.addEventListener("DOMContentLoaded", () => {
  const log = document.getElementById("ttsLog");
  const filters = [
    { id: "toggleCommands", label: "Blende Commands aus (!)" },
    { id: "toggleBots", label: "Blende Twitch Bots aus" },
    { id: "toggleUserOnly", label: "Nur Nachrichten von Benutzer anzeigen" },
    { id: "toggleMentions", label: "Nur @-Erwähnungen anzeigen" },
    { id: "toggleEmotes", label: "Emote-Nachrichten ausblenden" },
    { id: "toggleNoLinks", label: "Keine Links lesen" },
    { id: "toggleCapsFilter", label: "Capslock-Filter" },
    { id: "toggleRepeatFilter", label: "Wiederholungen erkennen" },
    { id: "toggleWordBan", label: "TTS-Bannliste (Wörter)" },
    { id: "toggleRoleFilter", label: "Nur Sub/VIP/Mod Nachrichten" },
    { id: "toggleTimeoutSafe", label: "Timeout-Wörter vermeiden" },
    { id: "toggleSystemMsg", label: "Systemmeldungen ignorieren" },
    { id: "toggleShortMsg", label: "Kurznachrichten überspringen" },
    { id: "toggleSymbolSpam", label: "Symbol/Emoji-Spam filtern" }
  ];

  function writeFilterLog(label, checked) {
    if (!log) return;
    const entry = document.createElement("div");
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] Filter ${checked ? "aktiviert" : "deaktiviert"}: ${label}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  filters.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => writeFilterLog(label, el.checked));
  });

  // Moderatoren-Filter mitschreiben
  document.querySelectorAll('input[name="modFilter"]').forEach(box => {
    box.addEventListener("change", () =>
      writeFilterLog(`Moderatoren-Filter → ${box.value}`, box.checked)
    );
  });
});

  // Aktiviert SlideFade-Animationen beim Laden
  // 💫 Harmonische SlideFade-Steuerung
document.addEventListener("DOMContentLoaded", () => {

  // === Zuordnung: Checkbox <-> Eingabefeld ===
  const toggles = [
    { toggle: "toggleCommands", input: "blockCommands" },
    { toggle: "toggleBots", input: "blockBots" },
    { toggle: "toggleUserOnly", input: "filterUserOnly" },
    { toggle: "toggleMentions", input: "filterMentions" }
  ];

  toggles.forEach(({ toggle, input }) => {
    const t = document.getElementById(toggle);
    const i = document.getElementById(input);

    if (t && i) {
      t.addEventListener("change", () => {
        if (t.checked) {
          i.style.display = "block";
          i.style.opacity = 0;
          i.style.transition = "opacity 0.3s ease";
          setTimeout(() => (i.style.opacity = 1), 10);
        } else {
          i.style.opacity = 0;
          setTimeout(() => (i.style.display = "none"), 300);
        }
      });
    }
  });

  // === Gesamtschalter (TTS Filter An/Aus) ===
  const toggleTTSFilter = document.getElementById("toggleTTSFilter");
  const filterGroup = document.getElementById("filterGroup");

    if (toggleTTSFilter && filterGroup) {
    toggleTTSFilter.addEventListener("change", () => {
      if (toggleTTSFilter.checked) {
        filterGroup.classList.add("active");
        filterGroup.classList.remove("hidden");
      } else {
        filterGroup.classList.remove("active");
        setTimeout(() => filterGroup.classList.add("hidden"), 300);
      }
    });
  }

});

// 🌙✨ Exklusiv-Logik für Moderatoren-Filter (nur eine Checkbox aktiv)
document.querySelectorAll('.mod-filter input[type="checkbox"]').forEach(chk => {
  chk.addEventListener('change', e => {
    if (e.target.checked) {
      document.querySelectorAll('.mod-filter input[type="checkbox"]').forEach(other => {
        if (other !== e.target) other.checked = false;
      });

      const logArea = document.getElementById("ttsLog");
      if (logArea) {
        const entry = document.createElement("div");
        const labelText = e.target.parentElement.textContent.trim();
        entry.textContent = `[${new Date().toLocaleTimeString()}] Moderatoren-Filter: ${labelText}`;
        logArea.appendChild(entry);
        logArea.scrollTop = logArea.scrollHeight;
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════
 🌞🌗✨🌙❤🌙✨ TRUE HARMONY EXTENSION – AUTO-RESIZE MESSAGE PANEL
   Version v1.0.3 Extended (Astra ❤✨ & Commander ❤🌙 Edition)
   Funktion: Dynamische Anpassung der Nachrichten-Panel-Höhe im Vollbild & Fenstermodus
════════════════════════════════════════════════════════════════════════════════════════════════════ */
const messageArea = document.querySelector('section.panel textarea');

function adjustLogHeight() {
  const newHeight = Math.max(window.innerHeight * 0.3, 150); // mind. 150 px
  messageArea.style.height = newHeight + "px";
}

window.addEventListener('resize', adjustLogHeight);
document.addEventListener('DOMContentLoaded', adjustLogHeight);

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("systemClock").textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();


function connectToTwitchChat(channelName, accessToken) {
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true
    },
    identity: {
      username: channelName,
      password: `oauth:${accessToken}`
    },
    channels: [channelName]
  });

  client.connect()
    .then(() => appendLog(`Chat verbunden: ${channelName}`))
    .catch(err => appendLog(`Chat Fehler: ${err.message}`));

  client.on("message", (channel, tags, message, self) => {
    if (self) return;

    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
      chatBox.value += `${tags["display-name"]}: ${message}\n`;
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (document.getElementById("ttsToggle")?.checked) {
      speakChatMessage(message);
    }
  });
}

function speakChatMessage(text) {
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const selectedVoiceName = document.getElementById("voice")?.value;
  const selectedVoice = voices.find(v => v.name === selectedVoiceName);

  if (selectedVoice) utter.voice = selectedVoice;

  utter.rate = parseFloat(document.getElementById("rate")?.value || "1");
  utter.volume = parseFloat(document.getElementById("volume")?.value || "1");

  synth.speak(utter);
}
