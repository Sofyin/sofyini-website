const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const customCursor = $("#customCursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (customCursor && finePointer.matches) {
  document.body.classList.add("has-custom-cursor");
  const cursorLabel = $(".custom-cursor span", customCursor);
  const magneticTargets = $$("a, button, .project-card, .archive-card");
  magneticTargets.forEach(element => element.classList.add("magnetic-target"));
  let currentMagnet = null;

  function releaseMagnet() {
    currentMagnet?.style.removeProperty("--magnet-x");
    currentMagnet?.style.removeProperty("--magnet-y");
    currentMagnet = null;
  }

  document.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
    customCursor.classList.remove("is-hidden");
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest("input, textarea, [contenteditable='true']")) {
      customCursor.classList.add("is-hidden");
      releaseMagnet();
      return;
    }

    const interactive = target.closest("a, button, [role='button'], video");
    if (!interactive) {
      customCursor.classList.remove("is-active");
      releaseMagnet();
      return;
    }
    const label = interactive.closest(".project-card, .archive-card") ? "VIEW"
      : interactive.matches("#musicPlay, video, [data-cursor='play']") ? "PLAY"
      : "OPEN";
    cursorLabel.textContent = label;
    customCursor.classList.add("is-active");

    const magnet = interactive.closest(".magnetic-target");
    if (!magnet || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      releaseMagnet();
      return;
    }
    if (currentMagnet !== magnet) releaseMagnet();
    currentMagnet = magnet;
    const rect = magnet.getBoundingClientRect();
    const offsetX = Math.max(-5, Math.min(5, (event.clientX - rect.left - rect.width / 2) * 0.12));
    const offsetY = Math.max(-5, Math.min(5, (event.clientY - rect.top - rect.height / 2) * 0.12));
    magnet.style.setProperty("--magnet-x", `${offsetX}px`);
    magnet.style.setProperty("--magnet-y", `${offsetY}px`);
  });

  document.addEventListener("pointerdown", () => customCursor.classList.add("is-clicking"));
  window.addEventListener("pointerup", () => customCursor.classList.remove("is-clicking"));
  window.addEventListener("blur", () => {
    customCursor.classList.add("is-hidden");
    releaseMagnet();
  });
  document.documentElement.addEventListener("pointerleave", () => customCursor.classList.add("is-hidden"));
}
const liveDate = $("#liveDate");
const liveTime = $("#liveTime");
function updateLiveClock() {
  const now = new Date();
  const dateOptions = { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric" };
  const timeOptions = { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" };
  if (liveDate) {
    liveDate.textContent = new Intl.DateTimeFormat("id-ID", dateOptions).format(now).replace(/\./g, "");
    liveDate.dateTime = now.toISOString();
  }
  if (liveTime) {
    liveTime.textContent = new Intl.DateTimeFormat("id-ID", timeOptions).format(now);
    liveTime.dateTime = now.toISOString();
  }
}
updateLiveClock();
window.setInterval(updateLiveClock, 1000);
let introActiveThisLoad = false;
let revealElements = [];
let pageRevealStarted = false;
function startPageReveal() {
  if (pageRevealStarted) return;
  pageRevealStarted = true;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    revealElements.forEach(element => element.classList.add("is-visible"));
  }));
}

// One short intro per browser tab session; clicking anywhere skips it.
const introScreen = $("#introScreen");
if (introScreen) {
  try {
    if (sessionStorage.getItem("sofyini-intro-seen")) {
      introScreen.remove();
    } else {
      introActiveThisLoad = true;
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
        window.setTimeout(() => {
          introScreen.remove();
          startPageReveal();
        }, 1050);
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

// Lightweight pointer-reactive particles: redraw only on input or resize.
const particleCanvas = $("#interactiveBackground");
const heroScreen = $("#home");
if (particleCanvas && heroScreen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const particleContext = particleCanvas.getContext("2d");
  let particles = [];
  let pointer = null;
  let particleFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelRatio = 1;

  function drawInteractiveParticles() {
    particleFrame = 0;
    const bounds = heroScreen.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    if (!width || !height || !particleContext) return;
    const nextRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    if (width !== canvasWidth || height !== canvasHeight || nextRatio !== pixelRatio) {
      canvasWidth = width;
      canvasHeight = height;
      pixelRatio = nextRatio;
      particleCanvas.width = Math.round(width * pixelRatio);
      particleCanvas.height = Math.round(height * pixelRatio);
      particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = Math.min(38, Math.max(18, Math.round(width * height / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.45
      }));
    }

    particleContext.clearRect(0, 0, width, height);
    particles.forEach(particle => {
      let x = particle.x;
      let y = particle.y;
      if (pointer) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const reach = 150;
        if (distance > 0 && distance < reach) {
          const force = (1 - distance / reach) * 13;
          x += (dx / distance) * force;
          y += (dy / distance) * force;
        }
      }
      particleContext.beginPath();
      particleContext.fillStyle = themeAccentColor;
      particleContext.globalAlpha = particle.alpha;
      particleContext.arc(x, y, particle.radius, 0, Math.PI * 2);
      particleContext.fill();
      particleContext.globalAlpha = 1;
    });
  }

  function requestParticleDraw() {
    if (!particleFrame) particleFrame = requestAnimationFrame(drawInteractiveParticles);
  }

  heroScreen.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const bounds = heroScreen.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    requestParticleDraw();
  }, { passive: true });
  heroScreen.addEventListener("pointerleave", () => {
    pointer = null;
    requestParticleDraw();
  }, { passive: true });
  window.addEventListener("resize", requestParticleDraw, { passive: true });
  requestParticleDraw();
}

// Slide page content in with a short stagger on initial load.
revealElements = $("main").querySelectorAll(
  ".hero-copy > *, .hero-art, .section-topline, .section-title-row, .category-tabs, .project-card, .archive-row, .archive-card, .profile-layout > *, .social-content > *, .social-list a, .screen footer"
);
revealElements.forEach((element, index) => {
  element.classList.add("reveal-element");
  element.style.setProperty("--reveal-delay", `${index * 35}ms`);
});
if (!introActiveThisLoad) startPageReveal();

// Mobile nav
const menuToggle = $("#menuToggle");
const mainNav = $(".main-nav");
menuToggle?.addEventListener("click", () => {
  mainNav.classList.toggle("show");
  requestAnimationFrame(moveNavIndicator);
});
navLinks.forEach(link => link.addEventListener("click", () => mainNav?.classList.remove("show")));

// Add a brief visual curtain while keeping native section scrolling and URL hashes.
let pageTransitionTimer = 0;
let scheduledSectionScroll = 0;
document.addEventListener("click", event => {
  const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
  if (!link) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  if (pageTransitionTimer) window.clearTimeout(pageTransitionTimer);
  if (scheduledSectionScroll) window.clearTimeout(scheduledSectionScroll);
  document.body.classList.remove("page-transition");
  void document.body.offsetWidth;
  document.body.classList.add("page-transition");
  if (location.hash !== link.hash) history.pushState(null, "", link.hash);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scheduledSectionScroll = window.setTimeout(() => {
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    scheduledSectionScroll = 0;
  }, 110);
  pageTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove("page-transition");
    pageTransitionTimer = 0;
  }, reduceMotion ? 20 : 950);
});

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

// Project case studies and artwork preview modal
const modal = $("#previewModal");
const previewImage = $("#previewImage");
const previewTitle = $("#previewTitle");
const caseStudyModal = $("#caseStudyModal");
const caseStudyImage = $("#caseStudyImage");
const caseStudyGallery = $("#caseStudyGallery");
const caseStudyDetails = {
  "project-one": {
    number: "001",
    concept: "Poster karakter bertema ‘Welcome Home’ dengan palet pink, tipografi tulisan tangan, tekstur halftone, dan elemen scrapbook yang playful.",
    process: "Rincian proses pengerjaan belum tersedia.",
    tools: "Software yang digunakan belum dicantumkan.",
    gallery: []
  },
  "project-two": {
    number: "002",
    concept: "Poster karakter Sparkle dengan komposisi portrait berlapis, aksen ungu dan pink, serta detail HUD yang memberi nuansa layar karakter.",
    process: "Rincian proses pengerjaan belum tersedia.",
    tools: "Software yang digunakan belum dicantumkan.",
    gallery: []
  },
  "project-three": {
    number: "003",
    concept: "Eksplorasi UI pemilihan karakter Hu Tao dengan navigasi game, panel informasi kemampuan, dan karakter sebagai fokus utama.",
    process: "Rincian proses pengerjaan belum tersedia.",
    tools: "Software yang digunakan belum dicantumkan.",
    gallery: []
  }
};
let caseStudyOpener = null;
function setCaseStudyImage(src, alt) {
  if (!caseStudyImage) return;
  caseStudyImage.classList.remove("loaded");
  caseStudyImage.alt = alt;
  caseStudyImage.src = src;
}
caseStudyImage?.addEventListener("load", () => {
  caseStudyImage.classList.add("loaded");
  caseStudyImage.closest(".case-study-visual")?.classList.add("has-image");
});
caseStudyImage?.addEventListener("error", () => {
  caseStudyImage.classList.remove("loaded");
  caseStudyImage.closest(".case-study-visual")?.classList.remove("has-image");
});
function openCaseStudy(card) {
  const details = caseStudyDetails[card.dataset.case];
  if (!caseStudyModal || !details) return;
  caseStudyOpener = card;
  caseStudyImage?.closest(".case-study-visual")?.classList.remove("has-image");
  $("#caseStudyNumber").textContent = details.number;
  $("#caseStudyTitle").textContent = card.dataset.title || "PROJECT";
  $("#caseStudyCategory").textContent = card.querySelector(".project-meta small")?.textContent || card.dataset.category || "";
  $("#caseStudyConcept").textContent = details.concept;
  $("#caseStudyProcess").textContent = details.process;
  $("#caseStudyTools").textContent = details.tools;
  setCaseStudyImage(card.dataset.image, card.dataset.title || "Project artwork");
  caseStudyGallery.replaceChildren();
  if (details.gallery.length) {
    details.gallery.forEach((src, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.type = "button";
      thumbnail.className = "case-gallery-thumb";
      thumbnail.setAttribute("aria-label", `View gallery image ${index + 1}`);
      const image = document.createElement("img");
      image.src = src;
      image.alt = `${card.dataset.title} gallery ${index + 1}`;
      thumbnail.append(image);
      thumbnail.addEventListener("click", () => setCaseStudyImage(src, image.alt));
      caseStudyGallery.append(thumbnail);
    });
  } else {
    const emptyGallery = document.createElement("p");
    emptyGallery.className = "case-gallery-empty";
    emptyGallery.textContent = "Galeri tambahan belum tersedia.";
    caseStudyGallery.append(emptyGallery);
  }
  caseStudyModal.classList.add("open");
  caseStudyModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#caseStudyClose")?.focus();
}
function closeCaseStudy() {
  if (!caseStudyModal?.classList.contains("open")) return;
  caseStudyModal.classList.remove("open");
  caseStudyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  caseStudyOpener?.focus();
}
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
  if (card.matches(".project-card")) card.addEventListener("click", () => openCaseStudy(card));
  else card.addEventListener("click", () => openPreview(card.dataset.image, card.dataset.title));
});
$("#previewClose")?.addEventListener("click", closePreview);
modal?.addEventListener("click", e => { if (e.target === modal) closePreview(); });
const videoPreview = $("#videoPreview");
const videoPreviewPlayer = $("#videoPreviewPlayer");
let videoPreviewOpener = null;
function openVideoPreview(card) {
  if (!videoPreview || !videoPreviewPlayer) return;
  videoPreviewOpener = card;
  videoPreviewPlayer.src = card.dataset.video;
  $("#videoPreviewCaption").textContent = card.dataset.title || "VIDEO PREVIEW";
  videoPreview.classList.add("open");
  videoPreview.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  videoPreviewPlayer.play().catch(() => {});
  $("#videoPreviewClose")?.focus();
}
function closeVideoPreview() {
  if (!videoPreview?.classList.contains("open")) return;
  videoPreview.classList.remove("open");
  videoPreview.setAttribute("aria-hidden", "true");
  videoPreviewPlayer?.pause();
  if (videoPreviewPlayer) {
    videoPreviewPlayer.removeAttribute("src");
    videoPreviewPlayer.load();
  }
  document.body.style.overflow = "";
  videoPreviewOpener?.focus();
}
$$(".video-card").forEach(card => card.addEventListener("click", () => openVideoPreview(card)));
$("#videoPreviewClose")?.addEventListener("click", closeVideoPreview);
videoPreview?.addEventListener("click", event => { if (event.target === videoPreview) closeVideoPreview(); });
videoPreviewPlayer?.addEventListener("dblclick", () => {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else videoPreviewPlayer.requestFullscreen?.();
});
$("#caseStudyClose")?.addEventListener("click", closeCaseStudy);
$("#caseStudyBack")?.addEventListener("click", closeCaseStudy);
caseStudyModal?.addEventListener("click", event => {
  if (event.target === caseStudyModal) closeCaseStudy();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closePreview();
    closeCaseStudy();
    closeVideoPreview();
  }
});

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

// Theme presets
const themePreset = $("#themePreset");
const availableThemes = new Set(["dark", "light", "neon", "monochrome", "retro"]);
let themeAccentColor = "#caff3b";
function setTheme(theme) {
  const selectedTheme = availableThemes.has(theme) ? theme : "dark";
  document.body.dataset.theme = selectedTheme;
  document.body.classList.toggle("light-mode", selectedTheme === "light");
  if (themePreset) themePreset.value = selectedTheme;
  themeAccentColor = getComputedStyle(document.body).getPropertyValue("--theme-accent").trim() || "#caff3b";
  localStorage.setItem("sofyini-theme", selectedTheme);
}
setTheme(localStorage.getItem("sofyini-theme") || "dark");
themePreset?.addEventListener("change", () => setTheme(themePreset.value));


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
  "You by-Lloyd, Lil Wayne.mp3",
  "nte_gw_bgm_20250514.mp3",
  "bgm-a8107a2c.mp3"
];

let currentTrack = 0;
let audioContext = null;
let analyser = null;
let source = null;
let dataArray = null;
const musicLoadIndicator = $("#musicLoadIndicator");
const musicLoadPercent = $("#musicLoadPercent");
const musicLoadBar = $("#musicLoadBar");

function updateMusicLoadProgress() {
  if (!audio || !musicLoadIndicator) return;
  let percent = 0;
  if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.buffered.length) {
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    percent = Math.min(100, Math.floor((bufferedEnd / audio.duration) * 100));
  }
  musicLoadIndicator.setAttribute("aria-valuenow", String(percent));
  if (musicLoadPercent) musicLoadPercent.textContent = `${percent}%`;
  if (musicLoadBar) musicLoadBar.style.width = `${percent}%`;
}

function loadTrack(index) {
  if (!audio || !playlist.length) return;
  currentTrack = (index + playlist.length) % playlist.length;
  const fileName = playlist[currentTrack];
  if (musicLoadIndicator) musicLoadIndicator.hidden = false;
  updateMusicLoadProgress();
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
    ctx.fillStyle = themeAccentColor;
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
audio?.addEventListener("loadstart", () => {
  if (musicLoadIndicator) musicLoadIndicator.hidden = false;
  updateMusicLoadProgress();
});
audio?.addEventListener("progress", updateMusicLoadProgress);
audio?.addEventListener("loadedmetadata", updateMusicLoadProgress);
audio?.addEventListener("canplay", () => {
  updateMusicLoadProgress();
  if (musicLoadIndicator) musicLoadIndicator.hidden = true;
});
audio?.addEventListener("playing", () => {
  if (musicLoadIndicator) musicLoadIndicator.hidden = true;
});
audio?.addEventListener("error", () => {
  if (musicLoadIndicator) musicLoadIndicator.hidden = true;
});
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
