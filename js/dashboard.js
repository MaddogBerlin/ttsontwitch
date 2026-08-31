// 🌙✨ True Harmony Darkmode mit Session-Gedächtnis
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Twitch-Verbindung bei echtem Seiten-Reload beenden
const navigationEntry = performance.getEntriesByType("navigation")[0];

if (navigationEntry?.type === "reload") {
  sessionStorage.removeItem("twitchToken");
}

// Zuletzt verbundenen Twitch-Account anzeigen
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("lastTwitchUser");
  const lastUserBox = document.getElementById("lastTwitchUser");

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hashToken = hashParams.get("access_token");
  const sessionToken = sessionStorage.getItem("twitchToken");

  if (savedUser && lastUserBox && !hashToken && !sessionToken) {
    lastUserBox.textContent = `↻ ${savedUser}`;
    lastUserBox.style.display = "block";
    lastUserBox.style.cursor = "pointer";

    lastUserBox.addEventListener("click", () => {
      document.getElementById("connectBtn")?.click();
});   
  }
});

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
const scope = "user:read:email chat:read"; // kann bei Bedarf erweitert werden, z. B. chat:read chat:edit

// Funktion: Startet den Twitch-Login-Flow
document.getElementById("connectBtn").addEventListener("click", () => {
  const authUrl =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&force_verify=true` +
    `&scope=${encodeURIComponent(scope)}`;

  // Weiterleitung zu Twitch Login
  window.location.href = authUrl;
});

// Funktion: Prüft beim Laden, ob ein Access-Token vorhanden ist
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken =
  params.get("access_token") ||
  sessionStorage.getItem("twitchToken");
  const statusBtn = document.getElementById("loginStatus");
  const connectBtn = document.getElementById("connectBtn");
  const log = document.getElementById("ttsLog");

  if (accessToken) {
  sessionStorage.setItem("twitchToken", accessToken);

  // Token-Parameter aus URL entfernen
  window.history.replaceState({}, document.title, window.location.pathname);

    // Benutzerinfos abrufen
    fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Client-Id": clientId
      }
    })
      .then(res => {
        if (res.status === 401) {
        throw new Error("Twitch-Token ist ungültig oder abgelaufen.");
      }

        if (!res.ok) {
          throw new Error(`Twitch API Fehler (${res.status})`);
        }

        return res.json();
    })
      .then(data => {
        const user = data.data?.[0];
        if (user) {
          // Zuletzt erfolgreich verbundenen Twitch-Account merken
          localStorage.setItem("lastTwitchUser", user.login);
          connectToTwitchChat(user.login, accessToken);

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

          // Twitch-Eingabe nach erfolgreicher Verbindung ausblenden
          const twitchNameInput = document.getElementById("twitchName");
          const twitchNameLabel = document.querySelector('label[for="twitchName"]');

          if (twitchNameInput) {
            twitchNameInput.style.display = "none";
          }

          if (twitchNameLabel) {
            twitchNameLabel.style.display = "none";
          }

          // "Verbinden"-Button deaktivieren
          connectBtn.textContent = "Verbunden";
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

  const savedVoice = voiceSelect.dataset.savedVoice;

  if (savedVoice && voices.some(v => v.name === savedVoice)) {
    voiceSelect.value = savedVoice;
  }
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
  { id: "toggleNoLinks", label: "Keine Links lesen" },
  { id: "toggleWordBan", label: "TTS-Bannliste (Wörter)" },
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
  { toggle: "toggleWordBan", input: "blockWords" }
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

// 🌙✨ TTS Einstellungen – dauerhaftes LocalStorage-Gedächtnis
const TTS_SETTINGS_KEY = "ttsSettings";

function saveTTSSettings() {
  const settings = {
  ttsEnabled:
    document.getElementById("ttsToggle")?.checked || false,

  ttsFilterEnabled:
    document.getElementById("toggleTTSFilter")?.checked || false,

  toggleCommands:
    document.getElementById("toggleCommands")?.checked || false,

  toggleBots:
    document.getElementById("toggleBots")?.checked || false,

  toggleNoLinks:
    document.getElementById("toggleNoLinks")?.checked || false,

  toggleWordBan:
    document.getElementById("toggleWordBan")?.checked || false,

  toggleSymbolSpam:
  document.getElementById("toggleSymbolSpam")?.checked || false,

  blockCommands:
    document.getElementById("blockCommands")?.value || "",

  blockBots:
    document.getElementById("blockBots")?.value || "",

  blockWords:
  document.getElementById("blockWords")?.value || "",

  modFilter:
  document.querySelector('input[name="modFilter"]:checked')?.value || "all",

  voice:
  document.getElementById("voice")?.value || "",

  rate:
    document.getElementById("rate")?.value || "1",

  volume:
  document.getElementById("volume")?.value || "1",

  bass:
    document.getElementById("bassControl")?.value || "0",

  mid:
    document.getElementById("midControl")?.value || "0",

  treble:
    document.getElementById("trebleControl")?.value || "0"
  };

  localStorage.setItem(
    TTS_SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

[
  "toggleCommands",
  "toggleBots",
  "toggleNoLinks",
  "toggleWordBan",
  "toggleSymbolSpam"
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    "change",
    saveTTSSettings
  );
});

[
  "blockCommands",
  "blockBots",
  "blockWords"
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    "input",
    saveTTSSettings
  );
});

document.getElementById("ttsToggle")?.addEventListener(
  "change",
  saveTTSSettings
);

document.getElementById("toggleTTSFilter")?.addEventListener(
  "change",
  saveTTSSettings
);

document.querySelectorAll('input[name="modFilter"]').forEach(box => {
  box.addEventListener(
    "change",
    saveTTSSettings
  );
});

document.getElementById("voice")?.addEventListener(
  "change",
  saveTTSSettings
);

[
  "rate",
  "volume"
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    "input",
    saveTTSSettings
  );
});

[
  "bassControl",
  "midControl",
  "trebleControl"
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    "input",
    saveTTSSettings
  );
});

function loadTTSSettings() {
  const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);

  if (!savedSettings) return;

  const settings = JSON.parse(savedSettings);

  const ttsToggle = document.getElementById("ttsToggle");

  if (ttsToggle && typeof settings.ttsEnabled === "boolean") {
    ttsToggle.checked = settings.ttsEnabled;
  }

  const ttsFilterToggle = document.getElementById("toggleTTSFilter");

  if (ttsFilterToggle && typeof settings.ttsFilterEnabled === "boolean") {
    ttsFilterToggle.checked = settings.ttsFilterEnabled;
  }

  [
  "toggleCommands",
  "toggleBots",
  "toggleNoLinks",
  "toggleWordBan",
  "toggleSymbolSpam"
  ].forEach(id => {
    const element = document.getElementById(id);

    if (element && typeof settings[id] === "boolean") {
      element.checked = settings[id];
    }
  });

  [
    "blockCommands",
    "blockBots",
    "blockWords"
  ].forEach(id => {
    const element = document.getElementById(id);

    if (element && typeof settings[id] === "string") {
      element.value = settings[id];
    }
  });

    if (typeof settings.modFilter === "string") {
    document.querySelectorAll('input[name="modFilter"]').forEach(box => {
      box.checked = box.value === settings.modFilter;
    });
  }

  const rate = document.getElementById("rate");
  const volume = document.getElementById("volume");

  if (rate && typeof settings.rate === "string") {
    rate.value = settings.rate;
  }

  if (volume && typeof settings.volume === "string") {
    volume.value = settings.volume;
  }

  const bass = document.getElementById("bassControl");
  const mid = document.getElementById("midControl");
  const treble = document.getElementById("trebleControl");

  if (bass && typeof settings.bass === "string") {
    bass.value = settings.bass;
  }

  if (mid && typeof settings.mid === "string") {
    mid.value = settings.mid;
  }

  if (treble && typeof settings.treble === "string") {
    treble.value = settings.treble;
  }

  const voice = document.getElementById("voice");

  if (voice && typeof settings.voice === "string") {
    voice.dataset.savedVoice = settings.voice;
  }

  const rateValue = document.getElementById("rateValue");
  const volumeValue = document.getElementById("volumeValue");

  if (rate && rateValue) {
    rateValue.textContent = rate.value + "×";
  }

  if (volume && volumeValue) {
    volumeValue.textContent = Math.round(volume.value * 100) + " %";
  }

  if (bass) {
  eqFilters.bass.gain.value = bass.value;
  }

  if (mid) {
    eqFilters.mid.gain.value = mid.value;
  }

  if (treble) {
    eqFilters.treble.gain.value = treble.value;
  }

  const ttsOptions = document.getElementById("ttsOptions");

  if (ttsToggle && ttsOptions) {
    ttsOptions.classList.toggle("active", ttsToggle.checked);
  }

  const filterGroup = document.getElementById("filterGroup");

  if (ttsFilterToggle && filterGroup) {
    filterGroup.classList.toggle("active", ttsFilterToggle.checked);
    filterGroup.classList.toggle("hidden", !ttsFilterToggle.checked);
  }

  [
  { toggle: "toggleCommands", input: "blockCommands" },
  { toggle: "toggleBots", input: "blockBots" },
  { toggle: "toggleWordBan", input: "blockWords" }
].forEach(({ toggle, input }) => {
  const toggleElement = document.getElementById(toggle);
  const inputElement = document.getElementById(input);

  if (toggleElement && inputElement) {
    inputElement.style.display = toggleElement.checked ? "block" : "none";
    inputElement.style.opacity = toggleElement.checked ? "1" : "0";
  }
});
}

loadTTSSettings();
populateVoices();

function connectToTwitchChat(channelName, accessToken) {
  const client = new tmi.Client({
  options: {
    skipUpdatingEmotesets: true
  },

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

  const ttsFilterEnabled = document.getElementById("toggleTTSFilter")?.checked;

  // Nachricht im Twitch-Chat anzeigen
  const chatBox = document.getElementById("chatBox");
  if (chatBox) {
    chatBox.value += `${tags["display-name"]}: ${message}\n`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // === TTS Filter: Commands ausblenden ===
  const commandFilterEnabled = document.getElementById("toggleCommands")?.checked;

  if (ttsFilterEnabled && commandFilterEnabled) {
    const blockedCommands = document
      .getElementById("blockCommands")
      ?.value
      .split(",")
      .map(cmd => cmd.trim().toLowerCase())
      .filter(Boolean) || [];

    const command = message.trim().split(/\s+/)[0].toLowerCase();

    if (blockedCommands.includes(command)) {
      appendLog(`Command nicht gesprochen: ${command}`);
      return;
    }
  }

  // === TTS Filter: Twitch Bots ausblenden ===
  const botFilterEnabled = document.getElementById("toggleBots")?.checked;

  if (ttsFilterEnabled && botFilterEnabled) {
    const blockedBots = document
      .getElementById("blockBots")
      ?.value
      .split(",")
      .map(bot => bot.trim().toLowerCase())
      .filter(Boolean) || [];

    const sender = (tags["username"] || tags["display-name"] || "").toLowerCase();

    if (blockedBots.includes(sender)) {
      appendLog(`Bot nicht gesprochen: ${sender}`);
      return;
    }
  }

 // === TTS Filter: Keine Links lesen ===
  let ttsMessage = message;

  const noLinksFilterEnabled = document.getElementById("toggleNoLinks")?.checked;

  if (ttsFilterEnabled && noLinksFilterEnabled) {
    ttsMessage = ttsMessage.replace(
      /(?:https?:\/\/|www\.)[^\s]+/gi,
      "***"
    );
  }

  // === TTS Filter: Bannliste (Wörter) ===
  const wordBanFilterEnabled = document.getElementById("toggleWordBan")?.checked;

  if (ttsFilterEnabled && wordBanFilterEnabled) {
    const blockedWords = document
      .getElementById("blockWords")
      ?.value
      .split(",")
      .map(word => word.trim())
      .filter(Boolean) || [];

    blockedWords.forEach(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");

      ttsMessage = ttsMessage.replace(regex, "***");
    });
  }

  // === TTS Filter: Symbol/Emoji-Spam filtern ===
    const symbolSpamFilterEnabled =
      document.getElementById("toggleSymbolSpam")?.checked;

    if (ttsFilterEnabled && symbolSpamFilterEnabled) {

      // Twitch-Emotes aus den von Twitch gelieferten Emote-Daten erkennen
      if (tags.emotes) {
        const twitchEmotes = [];

        Object.values(tags.emotes).forEach(ranges => {
          ranges.forEach(range => {
            const [start, end] = range.split("-").map(Number);
            const emoteName = message.slice(start, end + 1);

            if (emoteName) {
              twitchEmotes.push(emoteName);
            }
          });
        });

        twitchEmotes.forEach(emoteName => {
          const escapedEmote = emoteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapedEmote, "g");

          ttsMessage = ttsMessage.replace(regex, "");
        });
      }

      // Normale Unicode-Emojis aus der TTS-Ausgabe entfernen
      ttsMessage = ttsMessage.replace(
        /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu,
        ""
      );

      // Leerzeichen nach dem Entfernen sauber zusammenziehen
      ttsMessage = ttsMessage.replace(/\s+/g, " ").trim();
  }

  // === TTS Filter: Moderatoren ===
  const selectedModFilter =
    document.querySelector('input[name="modFilter"]:checked')?.value || "all";

  const isModerator =
    tags.mod === true ||
    tags.mod === "1" ||
    tags.badges?.moderator === "1";

  if (ttsFilterEnabled) {

    // Nur Moderatoren sprechen
    if (selectedModFilter === "only" && !isModerator) {
      appendLog(`Nicht gesprochen: ${tags["display-name"]} ist kein Moderator.`);
      return;
    }

    // Moderatoren nicht sprechen
    if (selectedModFilter === "hide" && isModerator) {
      appendLog(`Moderator nicht gesprochen: ${tags["display-name"]}`);
      return;
    }
  }

  // === TTS Ausgabe ===
  if (document.getElementById("ttsToggle")?.checked) {
    speakChatMessage(ttsMessage);
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