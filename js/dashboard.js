// 🌙✨ True Harmony Darkmode mit Session-Gedächtnis
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Twitch-Verbindung bei echtem Seiten-Reload beenden
const navigationEntry = performance.getEntriesByType("navigation")[0];

if (navigationEntry?.type === "reload") {
  sessionStorage.removeItem("twitchToken");
}

// Beim Verlassen des Dashboards ist die Chatverbindung nicht mehr garantiert
window.addEventListener("pagehide", () => {
  sessionStorage.removeItem("twitchChatConnected");
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
const scope = "user:read:email chat:read moderator:read:followers channel:read:subscriptions"; // Followerzahl und Kanal-Abonnements abrufen

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

          
          // Twitch-Profilinformationen aktualisieren
          const userAvatar = document.getElementById("userAvatar");
          const userName = document.getElementById("userName");
          const twitchNameInput = document.getElementById("twitchName");

          // Verbindungsstatus nach erfolgreicher Twitch-Anmeldung ausblenden
          const disconnectedStatus = document.getElementById("twitchDisconnectedStatus");

          if (disconnectedStatus) {
            disconnectedStatus.hidden = true;
          }

          // Öffentlichen Twitch-Anzeigenamen neben dem Avatar anzeigen
          if (userName) {
            userName.textContent = user.display_name;
            userName.classList.remove("hidden");

            // Originale Twitch-Chatfarbe des Benutzers abrufen
            fetch(
              `https://api.twitch.tv/helix/chat/color?user_id=${encodeURIComponent(user.id)}`,
              {
                headers: {
                  "Authorization": "Bearer " + accessToken,
                  "Client-Id": clientId
                }
              }
            )
              .then(res => {
                if (!res.ok) {
                  throw new Error(`Twitch-Farb-API Fehler (${res.status})`);
                }

                return res.json();
              })
              .then(data => {
                const twitchColor = data.data?.[0]?.color;

                if (twitchColor && /^#[0-9a-fA-F]{6}$/.test(twitchColor)) {
                  userName.style.color = twitchColor;
                }
              })
              .catch(err => {
                console.warn("Twitch-Namensfarbe konnte nicht geladen werden:", err);
              });
          }

          // Twitch-Kontostatus aus den Profildaten übernehmen
          const twitchAccountType =
            document.getElementById("twitchAccountType");

          if (twitchAccountType) {
            const accountTypes = {
              affiliate: "Affiliate",
              partner: "Partner"
            };

            const accountType =
              accountTypes[user.broadcaster_type]
                ? user.broadcaster_type
                : "streamer";

            twitchAccountType.textContent =
              accountTypes[user.broadcaster_type] || "Streamer";

            // Passende CSS-Farbe für den Twitch-Accounttyp
            twitchAccountType.dataset.type = accountType;
          }

          // Twitch-Abonnements des angemeldeten Kanals prüfen
          fetch(
            `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${encodeURIComponent(user.id)}&first=100`,
            {
              headers: {
                "Authorization": "Bearer " + accessToken,
                "Client-Id": clientId
              }
            }
          )
            .then(res => {
              if (!res.ok) {
                throw new Error(`Twitch-Abonnement-API Fehler (${res.status})`);
              }

              return res.json();
            })
            .then(data => {
              // 📊 Abonnement-Tiers des angemeldeten Twitch-Kanals
              const tierCounts = {
                "1000": 0,
                "2000": 0,
                "3000": 0
              };

              // Jeden zurückgegebenen Abonnement-Eintrag auswerten
              (data.data || []).forEach(sub => {
                if (Object.hasOwn(tierCounts, sub.tier)) {
                  tierCounts[sub.tier]++;
                }
              });

              // 🔎 Vorläufige Kontrolle in der Browserkonsole
              console.log("Twitch-Abonnements – Gesamtzahl:", data.total);
              console.log("Tier 1:", tierCounts["1000"]);
              console.log("Tier 2:", tierCounts["2000"]);
              console.log("Tier 3:", tierCounts["3000"]);

              // ⭐ Persönliches Abonnement des angemeldeten Accounts suchen
              const ownSubscription = (data.data || []).find(
                sub => sub.user_id === user.id
              );

              const twitchSubscriptionTier =
                document.getElementById("twitchSubscriptionTier");

              const twitchTierValue =
                document.getElementById("twitchTierValue");

              if (ownSubscription && twitchSubscriptionTier && twitchTierValue) {
                const tierNames = {
                  "1000": "1",
                  "2000": "2",
                  "3000": "3"
                };

                const tier = tierNames[ownSubscription.tier];

                if (tier) {
                  twitchTierValue.textContent = tier;
                  twitchSubscriptionTier.hidden = false;
                }
              }
            })
            .catch(err => {
              console.error("Twitch-Abonnements konnten nicht geladen werden:", err);
            });

          // Twitch-Followerzahl des angemeldeten Kanals abrufen
          const twitchFollowerCount =
            document.getElementById("twitchFollowerCount");

          fetch(
            `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(user.id)}`,
            {
              headers: {
                "Authorization": "Bearer " + accessToken,
                "Client-Id": clientId
              }
            }
          )
            .then(res => {
              if (!res.ok) {
                throw new Error(`Follower-API Fehler (${res.status})`);
              }

              return res.json();
            })
            .then(data => {
              if (twitchFollowerCount) {
                const total = Number(data.total);

                const formatFollowers = (count) => {
                  if (count < 100000) {
                    return count.toLocaleString("de-DE");
                  }

                  const divisor = count >= 1000000 ? 1000000 : 1000;
                  const suffix = count >= 1000000 ? "M" : "K";
                  const value = Math.floor((count / divisor) * 10) / 10;

                  return value.toLocaleString("de-DE", {
                    maximumFractionDigits: 1
                  }) + suffix;
                };

                twitchFollowerCount.textContent =
                  Number.isFinite(total) && total >= 0
                    ? formatFollowers(total)
                    : "–";
              }

              const twitchProfileStats =
                document.getElementById("twitchProfileStats");

              if (twitchProfileStats) {
                twitchProfileStats.hidden = false;
              }
            })
            .catch(err => {
              console.error("Twitch-Follower konnten nicht geladen werden:", err);
            });

          // Tatsächlichen Twitch-Loginnamen für die Statuszeile verwenden
          statusBtn.dataset.key = "connected_as";
          statusBtn.dataset.twitchDisplayName = user.login;

          const supportedLangs = ["de", "en", "fr", "es"];
          const savedLang = localStorage.getItem("lang");
          const browserLang = navigator.language?.substring(0, 2);

          const lang = supportedLangs.includes(savedLang)
            ? savedLang
            : supportedLangs.includes(browserLang)
              ? browserLang
              : "de";
          const connectedText =
            dashboardTranslations[lang]?.connected_as ||
            dashboardTranslations.de.connected_as;

          statusBtn.textContent = `${connectedText} ${user.login}`;
          statusBtn.classList.remove("disconnected");
          statusBtn.classList.add("connected");
          statusBtn.hidden = false;

          // Eingabefeld sichtbar lassen und Loginstatus anzeigen
          if (twitchNameInput) {
            twitchNameInput.value = `${connectedText} ${user.login}`;
            twitchNameInput.disabled = true;
          }

          // "Verbinden"-Button deaktivieren
          connectBtn.dataset.key = "btn_connected";
          connectBtn.textContent =
            dashboardTranslations[lang]?.btn_connected ||
            dashboardTranslations.de.btn_connected;

          connectBtn.disabled = true;
          connectBtn.classList.add("connected");

          // Die Hauptschalter werden erst nach erfolgreicher
          // Twitch-Chatverbindung in connectToTwitchChat() freigegeben.

          // Vorhandenes Profilbild durch Twitch-Avatar ersetzen
          if (userAvatar) {
            userAvatar.src =
              user.profile_image_url || "assets/default_chatUser.png";
            userAvatar.alt = user.display_name;
            userAvatar.classList.remove("hidden");
          }
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
    // Ohne Verbindung keine Statusmeldung anzeigen
    statusBtn.textContent = "";
    statusBtn.hidden = true;
    statusBtn.classList.remove("connected");
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
// 🎙️ TTS-Hauptschalter und unabhängige Klappsteuerung
const ttsToggle = document.getElementById("ttsToggle");
const ttsOptions = document.getElementById("ttsOptions");
const ttsOptionsToggle = document.getElementById("ttsOptionsToggle");

function updateTTSOptionsVisibility() {
  // Stimmen-Einstellungen nur bei aktiver und freigegebener TTS-Checkbox
  const enabled = ttsToggle.checked && !ttsToggle.disabled;
  const expanded =
    enabled && ttsOptionsToggle.getAttribute("aria-expanded") === "true";

  ttsOptionsToggle.disabled = !enabled;
  ttsOptionsToggle.setAttribute("aria-expanded", String(expanded));
  ttsOptionsToggle.setAttribute(
    "aria-label",
    expanded ? "TTS-Einstellungen einklappen" : "TTS-Einstellungen aufklappen"
  );

  ttsOptions.classList.toggle("active", enabled);
  ttsOptions.classList.toggle("tts-collapsed", !expanded);
}

ttsToggle.addEventListener("change", () => {
  if (!ttsToggle.checked) {
    ttsOptionsToggle.setAttribute("aria-expanded", "false");
  }

  updateTTSOptionsVisibility();
});

ttsOptionsToggle.addEventListener("click", () => {
  if (!ttsToggle.checked || ttsToggle.disabled) return;

  const expanded =
    ttsOptionsToggle.getAttribute("aria-expanded") === "true";

  // 🎙️ Stimmen öffnen: Filter-Einstellungen automatisch schließen
  if (!expanded) {
    filterOptionsToggle.setAttribute("aria-expanded", "false");
    updateFilterOptionsVisibility();
  }

  ttsOptionsToggle.setAttribute("aria-expanded", String(!expanded));
  updateTTSOptionsVisibility();
});

updateTTSOptionsVisibility();

// 🛡️ Filter-Hauptschalter und unabhängige Klappsteuerung
const filterToggle = document.getElementById("toggleTTSFilter");
const filterGroup = document.getElementById("filterGroup");
const filterOptionsToggle = document.getElementById("filterOptionsToggle");

function updateFilterOptionsVisibility() {
  const enabled = filterToggle.checked && !filterToggle.disabled;
  const expanded =
    enabled && filterOptionsToggle.getAttribute("aria-expanded") === "true";

  filterOptionsToggle.disabled = !enabled;
  filterOptionsToggle.setAttribute("aria-expanded", String(expanded));
  filterOptionsToggle.setAttribute(
    "aria-label",
    expanded ? "Filter-Einstellungen einklappen" : "Filter-Einstellungen aufklappen"
  );

  filterGroup.classList.toggle("active", enabled);
  filterGroup.classList.toggle("hidden", !enabled);
  filterGroup.classList.toggle("tts-collapsed", !expanded);
}

filterToggle.addEventListener("change", () => {
  if (!filterToggle.checked) {
    filterOptionsToggle.setAttribute("aria-expanded", "false");
  }

  updateFilterOptionsVisibility();
});

filterOptionsToggle.addEventListener("click", () => {
  if (!filterToggle.checked || filterToggle.disabled) return;

  const expanded =
    filterOptionsToggle.getAttribute("aria-expanded") === "true";

  // 🛡️ Filter öffnen: Stimmen-Einstellungen automatisch schließen
  if (!expanded) {
    ttsOptionsToggle.setAttribute("aria-expanded", "false");
    updateTTSOptionsVisibility();
  }

  filterOptionsToggle.setAttribute("aria-expanded", String(!expanded));
  updateFilterOptionsVisibility();
});

updateFilterOptionsVisibility();

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

// 🎧 Equalizer – aktuelle dB-Werte anzeigen
[
  ["bassControl", "bassValue"],
  ["midControl", "midValue"],
  ["trebleControl", "trebleValue"]
].forEach(([controlId, valueId]) => {
  const control = document.getElementById(controlId);
  const display = document.getElementById(valueId);

  if (!control || !display) return;

  const updateValue = () => {
    const value = Number(control.value);
    display.textContent = `${value > 0 ? "+" : ""}${value} dB`;
  };

  control.addEventListener("input", updateValue);
  updateValue();

  // Auch nach dem Laden gespeicherter Einstellungen aktualisieren
  window.addEventListener("load", updateValue);
});

// 🌙✨ Sprachfunktion – Astra & Commander Harmonischer Codefluss
const synth = window.speechSynthesis;
let voices = [];

function populateVoices() {
  voices = synth.getVoices();

  const voiceSelect = document.getElementById("voice");
  const viewerVoiceSelect = document.getElementById("ttsViewerVoice");

  voiceSelect.innerHTML = "";

  if (viewerVoiceSelect) {
  const supportedLangs = ["de", "en", "fr", "es"];
  const savedLang = localStorage.getItem("lang");
  const browserLang = navigator.language?.substring(0, 2);

  const lang = supportedLangs.includes(savedLang)
    ? savedLang
    : supportedLangs.includes(browserLang)
      ? browserLang
      : "de";

  const placeholder =
    dashboardTranslations[lang]?.ttsViewerVoicePlaceholder ||
    dashboardTranslations.de.ttsViewerVoicePlaceholder;

  viewerVoiceSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.dataset.key = "ttsViewerVoicePlaceholder";
  defaultOption.textContent = placeholder;

  viewerVoiceSelect.appendChild(defaultOption);
}

  voices.forEach((v) => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(option);

    if (viewerVoiceSelect) {
      const viewerOption = document.createElement("option");
      viewerOption.value = v.name;
      viewerOption.textContent = `${v.name} (${v.lang})`;
      viewerVoiceSelect.appendChild(viewerOption);
    }
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

// 🎙️ TTS Stimmen User – Zuschauerstimmen zuordnen
const VIEWER_VOICES_STORAGE_KEY = "ttsViewerVoices";
const viewerVoiceAssignments = new Map();

// 🎲 Zufällige Zuschauerstimmen pro Kalendertag
const DAILY_VIEWER_VOICES_STORAGE_KEY = "ttsDailyViewerVoices";
const dailyViewerVoices = new Map();

function getLocalTTSDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 🎲 Tagesstimmen aus dem lokalen Speicher laden
function loadDailyViewerVoices() {
  dailyViewerVoices.clear();

  try {
    const saved = JSON.parse(
      localStorage.getItem(DAILY_VIEWER_VOICES_STORAGE_KEY) || "null"
    );

    if (!saved || saved.date !== getLocalTTSDate()) {
      localStorage.removeItem(DAILY_VIEWER_VOICES_STORAGE_KEY);
      return;
    }

    if (!Array.isArray(saved.assignments)) return;

    saved.assignments.forEach(([name, voice]) => {
      if (typeof name === "string" && typeof voice === "string") {
        dailyViewerVoices.set(name, voice);
      }
    });
  } catch (error) {
    console.warn("Tagesstimmen konnten nicht geladen werden:", error);
  }
}

// 🎲 Zufällige Tagesstimmen im Dashboard anzeigen
function renderDailyViewerVoices() {
  const list = document.getElementById("ttsDailyVoicesList");
  if (!list) return;

  list.replaceChildren();

  dailyViewerVoices.forEach((voice, name) => {
    const entry = document.createElement("div");
    entry.className = "tts-daily-voice-entry";

    const nameElement = document.createElement("span");
    nameElement.className = "tts-daily-voice-name";
    nameElement.textContent = name;

    const voiceElement = document.createElement("span");
    voiceElement.className = "tts-daily-voice-selected";
    voiceElement.textContent = voice;
    voiceElement.title = voice;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "tts-daily-voice-delete";
    deleteButton.textContent = "✕";

    // 🌍 Sprachabhängiger Tooltip für zufällige Tagesstimmen
    const lang = localStorage.getItem("lang") || "de";

    const deleteTooltip =
      dashboardTranslations[lang]?.ttsDailyVoiceDelete ||
      dashboardTranslations.de.ttsDailyVoiceDelete;

    deleteButton.title = deleteTooltip;
    deleteButton.setAttribute(
      "aria-label",
      `${deleteTooltip}: ${name}`
    );
    deleteButton.dataset.tooltipKey = "ttsDailyVoiceDelete";

    // 🎲 Nur die zufällige Tagesstimme dieses Zuschauers entfernen
    deleteButton.addEventListener("click", () => {
      dailyViewerVoices.delete(name);
      saveDailyViewerVoices();
    });

    entry.append(nameElement, voiceElement, deleteButton);
    list.appendChild(entry);
  });
}

// 🎲 Tagesstimmen mit aktuellem Datum speichern
function saveDailyViewerVoices() {
  localStorage.setItem(
    DAILY_VIEWER_VOICES_STORAGE_KEY,
    JSON.stringify({
      date: getLocalTTSDate(),
      assignments: [...dailyViewerVoices.entries()]
    })
  );

  // 🎲 Tagesstimmenliste nach jeder Speicherung aktualisieren
  renderDailyViewerVoices();
}

// 🎲 Zufällige Tagesstimme für einen Zuschauer ermitteln
function getDailyViewerVoice(viewerName) {
  const name = viewerName.trim().toLowerCase();

  if (!name || voices.length === 0) return null;

  // Tageswechsel auch ohne F5 erkennen
  let saved = null;

  try {
    saved = JSON.parse(
      localStorage.getItem(DAILY_VIEWER_VOICES_STORAGE_KEY) || "null"
    );
  } catch (error) {
    console.warn("Ungültiger Tagesstimmen-Speicher:", error);
  }

  if (!saved || saved.date !== getLocalTTSDate()) {
    dailyViewerVoices.clear();
    saveDailyViewerVoices();
  }

  // Bereits ausgeloste Stimme weiterverwenden
  const existingVoice = dailyViewerVoices.get(name);

  if (existingVoice && voices.some(v => v.name === existingVoice)) {
    return existingVoice;
  }

  // Neue zufällige Stimme auswählen
  const randomVoice = voices[Math.floor(Math.random() * voices.length)];

  dailyViewerVoices.set(name, randomVoice.name);
  saveDailyViewerVoices();

  return randomVoice.name;
}

// Gespeicherte Zuschauerstimmen laden
function loadViewerVoiceAssignments() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(VIEWER_VOICES_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return;

    saved.forEach(entry => {
      if (
        typeof entry.name === "string" &&
        typeof entry.voice === "string" &&
        entry.name.trim() &&
        entry.voice.trim()
      ) {
        viewerVoiceAssignments.set(
          entry.name.trim().toLowerCase(),
          {
            name: entry.name.trim(),
            voice: entry.voice
          }
        );
      }
    });
  } catch (error) {
    console.warn("Zuschauerstimmen konnten nicht geladen werden:", error);
  }
}

// Zuschauerstimmen dauerhaft speichern
function saveViewerVoiceAssignments() {
  localStorage.setItem(
    VIEWER_VOICES_STORAGE_KEY,
    JSON.stringify([...viewerVoiceAssignments.values()])
  );
}

const viewerNameInput = document.getElementById("ttsViewerName");
const viewerVoiceInput = document.getElementById("ttsViewerVoice");
const viewerVoiceConfirm = document.getElementById("ttsViewerVoiceConfirm");
const viewerVoicesList = document.getElementById("ttsUserVoicesList");

function renderViewerVoices() {
  viewerVoicesList.replaceChildren();

  viewerVoiceAssignments.forEach(({ name, voice }) => {
    const entry = document.createElement("div");
    entry.className = "tts-user-voice-entry";

    const nameElement = document.createElement("span");
    nameElement.className = "tts-user-voice-name";
    nameElement.textContent = name;

    const voiceElement = document.createElement("span");
    voiceElement.className = "tts-user-voice-selected";
    voiceElement.textContent = voice;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "tts-user-voice-delete";
    deleteButton.textContent = "✕";
    const lang = localStorage.getItem("lang") || "de";

    const deleteTooltip =
      dashboardTranslations[lang]?.ttsViewerVoiceDelete ||
      dashboardTranslations.de.ttsViewerVoiceDelete;

    deleteButton.title = deleteTooltip;
    deleteButton.setAttribute("aria-label", `${deleteTooltip}: ${name}`);
    deleteButton.dataset.tooltipKey = "ttsViewerVoiceDelete";

    deleteButton.addEventListener("click", () => {
      viewerVoiceAssignments.delete(name.trim().toLowerCase());
      saveViewerVoiceAssignments();
      renderViewerVoices();
    });

    entry.append(nameElement, voiceElement, deleteButton);
    viewerVoicesList.appendChild(entry);
  });
}

viewerVoiceConfirm.addEventListener("click", () => {
  const name = viewerNameInput.value.trim();
  const voice = viewerVoiceInput.value;

  if (!name || !voice) {
    const lang = localStorage.getItem("lang") || "de";

appendLog(
  dashboardTranslations[lang]?.ttsViewerVoiceMissing ||
  dashboardTranslations.de.ttsViewerVoiceMissing
);
    return;
  }

  const key = name.toLowerCase();

  viewerVoiceAssignments.set(key, { name, voice });

  saveViewerVoiceAssignments();
  renderViewerVoices();

  const lang = localStorage.getItem("lang") || "de";

const message =
  dashboardTranslations[lang]?.ttsViewerVoiceAssigned ||
  dashboardTranslations.de.ttsViewerVoiceAssigned;

appendLog(`${message}: ${name} → ${voice}`);

  viewerNameInput.value = "";
  viewerVoiceInput.value = "";
});

// Gespeicherte Zuordnungen beim Seitenstart wiederherstellen
loadViewerVoiceAssignments();
renderViewerVoices();

// 🎲 Gespeicherte Tagesstimmen wiederherstellen
loadDailyViewerVoices();
renderDailyViewerVoices();

// 🎙️ TTS Stimmen Zuschauer – Aktivierung und Aufklappfunktion
const ttsUserVoicesToggle = document.getElementById("ttsUserVoicesToggle");
const ttsUserVoicesContent = document.querySelector(".tts-user-voices-content");

function updateTTSUserVoicesVisibility() {
  if (!ttsUserVoicesToggle || !ttsUserVoicesContent) return;

  const enabled = ttsUserVoicesToggle.checked;

  ttsUserVoicesContent.hidden = !enabled;
  ttsUserVoicesContent.style.display = enabled ? "" : "none";
}

ttsUserVoicesToggle?.addEventListener("change", () => {
  localStorage.setItem(
    "ttsUserVoicesEnabled",
    String(ttsUserVoicesToggle.checked)
  );

  updateTTSUserVoicesVisibility();

  const lang = localStorage.getItem("lang") || "de";

appendLog(
  ttsUserVoicesToggle.checked
    ? (dashboardTranslations[lang]?.ttsViewerVoicesEnabled ||
       dashboardTranslations.de.ttsViewerVoicesEnabled)
    : (dashboardTranslations[lang]?.ttsViewerVoicesDisabled ||
       dashboardTranslations.de.ttsViewerVoicesDisabled)
);
});

// Beim Laden den gespeicherten Schalterzustand wiederherstellen
const savedViewerVoicesEnabled = localStorage.getItem("ttsUserVoicesEnabled");

if (ttsUserVoicesToggle && savedViewerVoicesEnabled !== null) {
  ttsUserVoicesToggle.checked = savedViewerVoicesEnabled === "true";
}

// Beim Laden den richtigen Zustand herstellen
updateTTSUserVoicesVisibility();

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

  // 🎙️ TTS-Status nach dem Laden synchronisieren
  updateTTSOptionsVisibility();

  // 🛡️ Filterstatus nach dem Laden synchronisieren
  updateFilterOptionsVisibility();

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

function appendTwitchEmotes(container, message, emotes) {
  if (!emotes) {
    container.textContent = message;
    return;
  }

  const emotePositions = [];

  Object.entries(emotes).forEach(([emoteId, ranges]) => {
    ranges.forEach(range => {
      const [start, end] = range.split("-").map(Number);

      emotePositions.push({
        emoteId,
        start,
        end
      });
    });
  });

  emotePositions.sort((a, b) => a.start - b.start);

  let cursor = 0;

  emotePositions.forEach(({ emoteId, start, end }) => {
    if (start > cursor) {
      container.appendChild(
        document.createTextNode(message.slice(cursor, start))
      );
    }

    const emoteImg = document.createElement("img");

    emoteImg.src =
      `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;

    emoteImg.alt = message.slice(start, end + 1);
    emoteImg.style.height = "24px";
    emoteImg.style.verticalAlign = "middle";

    container.appendChild(emoteImg);

    cursor = end + 1;
  });

  if (cursor < message.length) {
    container.appendChild(
      document.createTextNode(message.slice(cursor))
    );
  }
}

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

  // Bei Verlust der Twitch-Chatverbindung die Hauptschalter sperren
  client.on("disconnected", () => {
    // Gespeicherten Twitch-Chatstatus zurücksetzen
    sessionStorage.removeItem("twitchChatConnected");

    document.getElementById("ttsToggle").disabled = true;
    document.getElementById("toggleTTSFilter").disabled = true;

    updateTTSOptionsVisibility();
    updateFilterOptionsVisibility();
  });

  // Nach erfolgreicher Wiederverbindung die Hauptschalter freigeben
  client.on("connected", () => {
    // Tatsächliche Twitch-Chatverbindung für die Startseite merken
    sessionStorage.setItem("twitchChatConnected", "true");

    document.getElementById("ttsToggle").disabled = false;
    document.getElementById("toggleTTSFilter").disabled = false;

    updateTTSOptionsVisibility();
    updateFilterOptionsVisibility();
  });

  client.connect()
    .then(() => appendLog(`Chat verbunden: ${channelName}`))
    .catch(err => appendLog(`Chat Fehler: ${err.message}`));

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  // Twitch-Benutzerinformationen für die Chat-Anzeige
  const displayName = tags["display-name"] || tags.username || "Unbekannt";
  const userColor = tags.color || "#ffffff";
  const badges = tags.badges || {};

  const isBroadcaster = badges.broadcaster === "1";
  const isMod = tags.mod === true || tags.mod === "1" || badges.moderator === "1";
  const isVip = badges.vip === "1";

  const ttsFilterEnabled = document.getElementById("toggleTTSFilter")?.checked;

  // Nachricht im Twitch-Chat anzeigen
  // Nachricht im Twitch-Chat anzeigen
  const chatBox = document.getElementById("chatBox");

  if (chatBox) {
    const chatMessage = document.createElement("div");

    const twitchLogo = document.createElement("img");
    twitchLogo.src = "assets/Twitch.png";
    twitchLogo.alt = "Twitch";
    twitchLogo.style.width = "20px";
    twitchLogo.style.height = "20px";
    twitchLogo.style.verticalAlign = "middle";
    twitchLogo.style.marginRight = "6px";

    const role = document.createElement("span");

    if (isBroadcaster) {
      role.textContent = "[Broadcaster] ";
    } else if (isMod) {
      role.textContent = "[Mod] ";
    } else if (isVip) {
      role.textContent = "[VIP] ";
    }

    const userName = document.createElement("span");
    userName.textContent = displayName;
    userName.style.color = userColor;

    const separator = document.createElement("span");
    separator.textContent = " » ";

    const messageText = document.createElement("span");
    appendTwitchEmotes(messageText, message, tags.emotes);

    chatMessage.appendChild(twitchLogo);
    if (role.textContent) {
    chatMessage.appendChild(role);
    }
    chatMessage.appendChild(userName);
    chatMessage.appendChild(separator);
    chatMessage.appendChild(messageText);

    chatBox.appendChild(chatMessage);
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


  // === TTS Ausgabe – nur mit aktiver Twitch-Verbindung ===
  const twitchConnected = client.readyState() === "OPEN";

  if (twitchConnected && document.getElementById("ttsToggle")?.checked) {
    const viewerName = tags.username || displayName;

    speakChatMessage(`${displayName} sagt: ${ttsMessage}`, viewerName);
  }

  });
}

const ttsQueue = [];
let ttsSpeaking = false;

function speakChatMessage(text, viewerName = "") {
  if (!text.trim()) return;

  ttsQueue.push({ text, viewerName });
  processTTSQueue();
}

function processTTSQueue() {
  if (ttsSpeaking || ttsQueue.length === 0) return;

  ttsSpeaking = true;
  const { text, viewerName } = ttsQueue.shift();

  const utter = new SpeechSynthesisUtterance(text);

  // Allgemeine TTS-Stimme als Standard
  let selectedVoiceName = document.getElementById("voice")?.value;

  // Individuelle Zuschauerstimmen nur bei aktiver Checkbox
  const viewerVoicesEnabled =
    document.getElementById("ttsUserVoicesToggle")?.checked === true;

  if (viewerVoicesEnabled && viewerName) {
    const assignment = viewerVoiceAssignments.get(
      viewerName.trim().toLowerCase()
    );

    if (assignment) {
      // 💾 Dauerhaft zugeordnete Stimme hat Vorrang
      selectedVoiceName = assignment.voice;
    } else {
      // 🎲 Ohne feste Zuordnung: zufällige Tagesstimme
      const dailyVoice = getDailyViewerVoice(viewerName);

      if (dailyVoice) {
        selectedVoiceName = dailyVoice;
      }
    }
  }

  const selectedVoice = voices.find(
    v => v.name === selectedVoiceName
  );

  if (selectedVoice) utter.voice = selectedVoice;

  utter.rate = parseFloat(document.getElementById("rate")?.value || "1");
  utter.volume = parseFloat(document.getElementById("volume")?.value || "1");

  utter.onend = () => {
    ttsSpeaking = false;
    processTTSQueue();
  };

  utter.onerror = (event) => {
    appendLog(`TTS-Fehler: ${event.error}`);
    ttsSpeaking = false;
    processTTSQueue();
  };

  synth.speak(utter);
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════════
 🌞🌗✨🌙❤🌙✨ TRUE HARMONY EXTENSION – AUTO-RESIZE MESSAGE PANEL
   Version v1.0.3 Extended (Astra ❤✨ & Commander ❤🌙 Edition)
   Funktion: Dynamische Anpassung der Nachrichten-Panel-Höhe im Vollbild & Fenstermodus
════════════════════════════════════════════════════════════════════════════════════════════════════ */
const messageArea = document.getElementById("chatBox");

function adjustLogHeight() {
  // Die Chat-Höhe wird künftig durch das Dashboard-Layout gesteuert.
  if (messageArea) {
    messageArea.style.removeProperty("height");
  }
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