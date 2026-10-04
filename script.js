const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// One short intro per browser tab session; clicking anywhere skips it.
const introScreen = $("#introScreen");
if (introScreen) {
  try {
    if (sessionStorage.getItem("sofyini-intro-seen")) {
      introScreen.remove();
    } else {
      sessionStorage.setItem("sofyini-intro-seen", "1");
      document.body.classList.add("intro-active");
      const introMessage = $("#introMessage");
      const handleIntroKey = event => {
        if (event.key === "Enter" || event.key === " ") enterIntro();
      };
      const enterIntro = () => {
        if (introScreen.classList.contains("is-opening")) return;
        introScreen.classList.add("is-opening");
        document.body.classList.remove("intro-active");
        document.removeEventListener("keydown", handleIntroKey);
        window.setTimeout(() => introScreen.remove(), 1050);
      };
      window.setTimeout(() => {
        if (introMessage && introScreen.isConnected) introMessage.textContent = "DESIGN. ART. EXPERIMENT.";
      }, 1450);
      window.setTimeout(() => introScreen.classList.add("is-ready"), 2900);
      introScreen.addEventListener("click", enterIntro);
      $("#introEnter")?.addEventListener("click", enterIntro);
      document.addEventListener("keydown", handleIntroKey);
    }
  } catch {
    introScreen.remove();
  }
}

// Main navigation active state + subbar label
const sectionNames = {
  home: "CREATIVE CHARACTER FILE",
  work: "CREATIVE DATABASE",
  about: "CREATOR INFORMATION",
  contact: "EXTERNAL NETWORK"
};
const sections = $$(".screen");
const navLinks = $$(".nav-link");
const subLinks = $$(".sub-link");
const subbarLabel = $("#subbarLabel");
function moveNavIndicator() {
  const nav = $(".main-nav");
  const activeLink = $(".nav-link.active", nav || document);
  if (!nav || !activeLink) return;
  nav.style.setProperty("--active-left", `${activeLink.offsetLeft}px`);
  nav.style.setProperty("--active-width", `${activeLink.offsetWidth}px`);
  nav.style.setProperty("--active-top", `${activeLink.offsetTop}px`);
  nav.style.setProperty("--active-height", `${activeLink.offsetHeight}px`);
}
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => a.classList.toggle("active", a.dataset.section === id));
    moveNavIndicator();
    if (subbarLabel) subbarLabel.textContent = sectionNames[id] || "SOFYINI ARCHIVE";
    subLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  });
}, {threshold: 0.5});
sections.forEach(section => observer.observe(section));
moveNavIndicator();
window.addEventListener("resize", moveNavIndicator);

// Slide page content in with a short stagger on initial load.
const revealElements = $("main").querySelectorAll(
  ".hero-copy > *, .hero-art, .section-topline, .section-title-row, .category-tabs, .project-card, .archive-row, .archive-card, .profile-layout > *, .social-content > *, .social-list a, .screen footer"
);
revealElements.forEach((element, index) => {
  element.classList.add("reveal-element");
  element.style.setProperty("--reveal-delay", `${index * 35}ms`);
});
requestAnimationFrame(() => requestAnimationFrame(() => {
  revealElements.forEach(element => element.classList.add("is-visible"));
}));

// Mobile nav
const menuToggle = $("#menuToggle");
const mainNav = $(".main-nav");
menuToggle?.addEventListener("click", () => {
  mainNav.classList.toggle("show");
  requestAnimationFrame(moveNavIndicator);
});
navLinks.forEach(link => link.addEventListener("click", () => mainNav?.classList.remove("show")));

// Hero ability selector
const abilityContent = {
  design: ["VISUAL DESIGN", "Building visual identities, compositions and graphic experiments with a strong sense of form."],
  art: ["DIGITAL ART", "Exploring digital illustration, image manipulation and expressive visual storytelling."],
  photo: ["UI/UX", "stands for User Interface (UI) and User Experience (UX), two distinct yet closely connected phases of designing digital products like apps and websites.Â "]
};
$$(".ability").forEach(button => {
  button.addEventListener("click", () => {
    $$(".ability").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const [title, description] = abilityContent[button.dataset.ability];
    $("#abilityTitle").textContent = title;
    $("#abilityDescription").textContent = description;
  });
});

// Project category filtering
$$(".category-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".category-tab").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    const filter = tab.dataset.filter;
    $$(".project-card").forEach(card => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

// Archive expand/collapse
$("#archiveToggle")?.addEventListener("click", e => {
  const grid = $("#archiveGrid");
  const opened = grid.classList.toggle("open");
  e.currentTarget.innerHTML = opened ? 'CLOSE ART ARCHIVE <b>âˆ’</b>' : 'OPEN ART ARCHIVE <b>ï¼‹</b>';
});

// Image preview modal
const modal = $("#previewModal");
const previewImage = $("#previewImage");
const previewTitle = $("#previewTitle");
function openPreview(src, title) {
  if (!modal || !previewImage) return;
  previewImage.src = src;
  previewImage.alt = title;
  previewTitle.textContent = title;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closePreview() {
  modal?.classList.remove("open");
  document.body.style.overflow = "";
}
$$(".project-card, .archive-card").forEach(card => {
  card.addEventListener("click", () => openPreview(card.dataset.image, card.dataset.title));
});
$("#previewClose")?.addEventListener("click", closePreview);
modal?.addEventListener("click", e => { if (e.target === modal) closePreview(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closePreview(); });

// Settings drawer
const drawer = $("#settingsDrawer");
const settingsTrigger = $("#settingsTrigger");
settingsTrigger?.addEventListener("click", () => drawer?.classList.toggle("open"));
$("#settingsClose")?.addEventListener("click", () => drawer.classList.remove("open"));
document.addEventListener("pointerdown", event => {
  if (
    drawer?.classList.contains("open") &&
    !drawer.contains(event.target) &&
    !settingsTrigger?.contains(event.target)
  ) {
    drawer.classList.remove("open");
  }
});

// Theme
const themeButton = $("#themeToggle");
function setTheme(theme) {
  document.body.classList.toggle("light-mode", theme === "light");
  if (themeButton) themeButton.textContent = theme.toUpperCase();
  localStorage.setItem("sofyini-theme", theme);
}
setTheme(localStorage.getItem("sofyini-theme") || "dark");
themeButton?.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light-mode") ? "dark" : "light");
});


// ==========================================
// MUSIC PLAYER + AUDIO VISUALIZER
// ==========================================

const audio = $("#bgMusic");
const musicPlayer = $("#musicPlayer");
const canvas = $("#visualizerCanvas");
const playBtn = $("#musicPlay");
const nextBtn = $("#musicNext");
const prevBtn = $("#musicPrev");
const title = $("#musicTitle");
const volumeControl = $("#volumeControl");
const volumeValue = $("#volumeValue");
const ctx = canvas?.getContext("2d");

const playlist = [
  "Ariana Grande - bye x Into You [Altare Remix] (Slowed + Reverb) _ Extended Remix.mp3",
  "OneRepublic - Sunshine (Official Audio) - OneRepublicVEVO (youtube).mp3",
  "おつかれSUMMER.mp3",
  "Everyday - Slowed + Reverb.mp3",
  "落泪 by-TOYOKI.mp3",
  "You by-Lloyd, Lil Wayne.mp3"
];

let currentTrack = 0;
let audioContext = null;
let analyser = null;
let source = null;
let dataArray = null;

function loadTrack(index) {
  if (!audio || !playlist.length) return;
  currentTrack = (index + playlist.length) % playlist.length;
  const fileName = playlist[currentTrack];
  audio.src = `assets/music/${encodeURIComponent(fileName)}`;
  audio.load();
  if (title) {
    title.textContent = fileName.replace(/\.[^/.]+$/, "");
    title.classList.remove("scrolling");
    requestAnimationFrame(() => {
      if (title.scrollWidth > title.clientWidth) title.classList.add("scrolling");
    });
  }
}

function setupVisualizer() {
  if (audioContext || !audio || !ctx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext = new AudioContextClass();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function renderVisualizer() {
  requestAnimationFrame(renderVisualizer);
  if (!canvas || !ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!analyser || !dataArray) return;
  analyser.getByteFrequencyData(dataArray);
  const bars = 24;
  const gap = 3;
  const barWidth = (width - gap * (bars - 1)) / bars;
  for (let i = 0; i < bars; i++) {
    const barHeight = Math.max(2, (dataArray[i] / 255) * height);
    ctx.fillStyle = "#caff3b";
    ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
  }
}

async function playMusic() {
  if (!audio) return;
  try {
    setupVisualizer();
    if (audioContext?.state === "suspended") await audioContext.resume();
    await audio.play();
  } catch (error) {
    console.warn("Music playback failed:", error);
  }
}

function toggleMusic() {
  if (!audio) return;
  if (audio.paused) playMusic();
  else audio.pause();
}

playBtn?.addEventListener("click", toggleMusic);
nextBtn?.addEventListener("click", async () => { loadTrack(currentTrack + 1); await playMusic(); });
prevBtn?.addEventListener("click", async () => { loadTrack(currentTrack - 1); await playMusic(); });
audio?.addEventListener("ended", async () => { loadTrack(currentTrack + 1); await playMusic(); });
audio?.addEventListener("play", () => {
  musicPlayer?.classList.add("is-playing");
  if (playBtn) playBtn.textContent = "❚❚";
});
audio?.addEventListener("pause", () => {
  musicPlayer?.classList.remove("is-playing");
  if (playBtn) playBtn.textContent = "▶";
});

if (audio && volumeControl && volumeValue) {
  audio.volume = Number(volumeControl.value) / 100;
  volumeValue.textContent = `${volumeControl.value}%`;
  volumeControl.addEventListener("input", () => {
    audio.volume = Number(volumeControl.value) / 100;
    volumeValue.textContent = `${volumeControl.value}%`;
  });
}

const visualizerToggle = $(".music-visualizer");
const collapseMusicButton = $("#musicCollapse");
function setMusicPlayerOpen(open) {
  musicPlayer?.classList.toggle("collapsed", !open);
  visualizerToggle?.setAttribute("aria-expanded", String(open));
}
visualizerToggle?.addEventListener("click", () => setMusicPlayerOpen(true));
visualizerToggle?.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setMusicPlayerOpen(true);
  }
});
collapseMusicButton?.addEventListener("click", () => setMusicPlayerOpen(false));
document.addEventListener("pointerdown", event => {
  if (musicPlayer && !musicPlayer.contains(event.target)) setMusicPlayerOpen(false);
});

loadTrack(0);
renderVisualizer();
