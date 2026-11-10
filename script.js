const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const customCursor = $("#customCursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (customCursor && finePointer.matches) {
  document.body.classList.add("has-custom-cursor");
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

// Device-local visit days: count this browser at most once per Jakarta day.
const visitorCount = $("#visitorCount");
if (visitorCount) {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const dateValues = Object.fromEntries(dateParts.map(part => [part.type, part.value]));
  const today = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;
  const storageKey = "sofyini-device-visits-v1";
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const total = Number.isSafeInteger(stored.total) && stored.total >= 0 ? stored.total : 0;
    const updated = stored.lastDate === today
      ? { total, lastDate: today }
      : { total: total + 1, lastDate: today };
    localStorage.setItem(storageKey, JSON.stringify(updated));
    visitorCount.textContent = String(updated.total).padStart(4, "0");
  } catch {
    visitorCount.textContent = "0001";
  }
}

let introActiveThisLoad = false;
let revealElements = [];
let pageRevealStarted = false;
let revealObserver;
function startPageReveal() {
  if (pageRevealStarted) return;
  pageRevealStarted = true;
  // Reveal anything already on screen after the browser has painted its
  // hidden starting state; keep observing the rest until they enter view.
  requestAnimationFrame(() => {
    revealElements.forEach(element => {
      const bounds = element.getBoundingClientRect();
      const visible = bounds.bottom > 0 && bounds.top < window.innerHeight &&
        bounds.right > 0 && bounds.left < window.innerWidth;
      if (visible) {
        element.classList.add("is-visible");
        return;
      }
      revealObserver.observe(element);
    });
  });
}

// Play the intro once per browser tab session, then open the archive automatically.
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
      const enterIntro = () => {
        if (introScreen.classList.contains("is-opening")) return;
        introScreen.classList.add("is-opening");
        document.body.classList.remove("intro-active");
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.setTimeout(() => {
          introScreen.remove();
          startPageReveal();
        }, reduceMotion ? 20 : 1050);
      };
      window.setTimeout(() => {
        if (introMessage && introScreen.isConnected) introMessage.textContent = "DESIGN. ART. EXPERIMENT.";
      }, 1450);
      window.setTimeout(enterIntro, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 3200);
    }
  } catch {
    introScreen.remove();
    startPageReveal();
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
const backToTop = $("#backToTop");
let backToTopTimer = 0;
let backToTopVisible = false;
function updateBackToTop() {
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (!atPageEnd) {
    window.clearTimeout(backToTopTimer);
    backToTopTimer = 0;
    backToTopVisible = false;
    backToTop?.classList.remove("is-visible");
    backToTop?.setAttribute("aria-hidden", "true");
    if (backToTop) backToTop.disabled = true;
    return;
  }
  if (backToTopVisible || backToTopTimer) return;
  backToTopTimer = window.setTimeout(() => {
    backToTopTimer = 0;
    if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) return;
    backToTopVisible = true;
    backToTop?.classList.add("is-visible");
    backToTop?.setAttribute("aria-hidden", "false");
    if (backToTop) backToTop.disabled = false;
  }, 350);
}
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
window.addEventListener("scroll", updateBackToTop, {passive: true});
window.addEventListener("resize", updateBackToTop);
updateBackToTop();
backToTop?.addEventListener("click", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, 0);
    return;
  }

  const startY = window.scrollY;
  const duration = 900;
  const startTime = performance.now();
  function animateScroll(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY * (1 - eased));
    if (progress < 1) requestAnimationFrame(animateScroll);
  }
  requestAnimationFrame(animateScroll);
});
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
  if (element.matches(".hero-copy > *, .section-title-row > div, .profile-layout > .profile-main, .social-content > *")) {
    element.classList.add("reveal-from-left");
  }
  // Keep the cascade lively without leaving later page elements hidden for
  // several seconds just because they appear later in the document.
  element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 560)}ms`);
});
revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0, rootMargin: "0px 0px -4% 0px" });
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

// Automatically populate artwork and video cards from the local asset index.
const categoryTabs = $("#categoryTabs");
const projectGrid = $("#projectGrid");
const videoShowcase = $("#videoShowcase");
const videoCardRow = $("#videoCardRow");
let assetSignature = "";

function assetTitle(filePath) {
  return filePath.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}
function assetCategory(relativePath) {
  const parts = relativePath.split("/").filter(Boolean);
  const rootFolder = ["portfolio", "artwork"].includes((parts[0] || "").toLowerCase()) ? 1 : 0;
  const categoryFolder = parts[rootFolder];
  return categoryFolder && parts.length - rootFolder > 1
    ? categoryFolder.replace(/[-_]+/g, " ").toUpperCase()
    : "ARTWORK";
}
function renderArtwork(artworks) {
  if (!projectGrid || !categoryTabs) return;
  projectGrid.replaceChildren();
  categoryTabs.replaceChildren();
  if (!artworks.length) {
    projectGrid.hidden = true;
    categoryTabs.hidden = true;
    return;
  }
  const categories = [...new Set(artworks.map(asset => assetCategory(asset.relativePath)))].sort();
  const allTab = document.createElement("button");
  allTab.className = "category-tab active";
  allTab.dataset.filter = "all";
  allTab.innerHTML = `ALL FILES <span>${String(artworks.length).padStart(2, "0")}</span>`;
  categoryTabs.append(allTab);
  categories.forEach(category => {
    const tab = document.createElement("button");
    tab.className = "category-tab";
    tab.dataset.filter = category;
    tab.textContent = category;
    categoryTabs.append(tab);
  });
  artworks.forEach((asset, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card magnetic-target";
    card.dataset.image = asset.url;
    card.dataset.title = assetTitle(asset.relativePath);
    card.dataset.category = assetCategory(asset.relativePath);
    const number = String(index + 1).padStart(2, "0");
    card.innerHTML = `<span class="project-number">FILE_${number}</span><span class="project-overlay"><b>${number}</b><span>OPEN FILE ↗</span></span><span class="project-meta"><b></b><small></small></span>`;
    const image = document.createElement("img");
    image.src = `${asset.url}?v=${asset.modified}`;
    image.alt = card.dataset.title;
    image.addEventListener("error", () => {
      card.remove();
      const remaining = projectGrid.querySelectorAll(".project-card").length;
      const count = $("#artworkCount");
      if (count) count.textContent = String(remaining).padStart(2, "0");
      if (!remaining) {
        projectGrid.hidden = true;
        categoryTabs.hidden = true;
      }
    }, {once:true});
    card.prepend(image);
    card.querySelector(".project-meta b").textContent = card.dataset.title;
    card.querySelector(".project-meta small").textContent = card.dataset.category;
    projectGrid.append(card);
  });
  categoryTabs.hidden = false;
  projectGrid.hidden = false;
}
function renderVideos(videos) {
  if (!videoShowcase || !videoCardRow) return;
  videoCardRow.replaceChildren();
  videoShowcase.hidden = !videos.length;
  const count = $("#videoCount");
  if (count) count.textContent = `00 / ${String(videos.length).padStart(2, "0")}`;
  videos.forEach((asset, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "video-card magnetic-target";
    card.dataset.video = `${asset.url}?v=${asset.modified}`;
    card.dataset.title = assetTitle(asset.relativePath);
    card.setAttribute("aria-label", `Play ${card.dataset.title}`);
    const video = document.createElement("video");
    video.src = card.dataset.video;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.tabIndex = -1;
    video.setAttribute("aria-hidden", "true");
    const play = document.createElement("span");
    play.className = "video-card-play";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "▶";
    const label = document.createElement("span");
    label.className = "video-card-title";
    label.innerHTML = `<b></b><small>VIDEO / ${String(index + 1).padStart(3, "0")}</small>`;
    label.querySelector("b").textContent = card.dataset.title;
    card.append(video, play, label);
    video.addEventListener("error", () => {
      card.remove();
      const remaining = videoCardRow.children.length;
      const count = $("#videoCount");
      if (count) count.textContent = `00 / ${String(remaining).padStart(2, "0")}`;
      if (!remaining) videoShowcase.hidden = true;
    }, {once:true});
    videoCardRow.append(card);
  });
}
async function refreshAssetGallery() {
  const loadStatus = $("#assetLoadStatus");
  try {
    let data;
    try {
      const response = await fetch("/api/assets", {cache:"no-store"});
      if (!response.ok) throw new Error("Local asset API unavailable");
      data = await response.json();
    } catch {
      const response = await fetch("/assets-index.json", {cache:"no-store"});
      if (!response.ok) throw new Error("Asset index unavailable");
      data = await response.json();
    }
    if (loadStatus) loadStatus.hidden = true;
    const signature = JSON.stringify(data);
    if (signature === assetSignature) return;
    assetSignature = signature;
    updateMusicPlaylist(data.music || []);
    const artworkCount = $("#artworkCount");
    if (artworkCount) artworkCount.textContent = String(data.artwork.length).padStart(2, "0");
    renderArtwork(data.artwork);
    renderVideos(data.videos);
  } catch {
    if (projectGrid) projectGrid.hidden = true;
    if (categoryTabs) categoryTabs.hidden = true;
    if (videoShowcase) videoShowcase.hidden = true;
    if (loadStatus) loadStatus.hidden = false;
  }
}
categoryTabs?.addEventListener("click", event => {
  const tab = event.target.closest(".category-tab");
  if (!tab) return;
  $$(".category-tab", categoryTabs).forEach(item => item.classList.toggle("active", item === tab));
  $$(".project-card", projectGrid).forEach(card => {
    card.hidden = tab.dataset.filter !== "all" && card.dataset.category !== tab.dataset.filter;
  });
});
refreshAssetGallery();
window.setInterval(refreshAssetGallery, 5000);

// Project case studies and artwork preview modal
const modal = $("#previewModal");
const previewImage = $("#previewImage");
const previewTitle = $("#previewTitle");
const previewImageStage = $("#previewImageStage");
const previewZoomRange = $("#previewZoomRange");
const previewZoomValue = $("#previewZoomValue");
let previewZoom = 1;
const previewPointers = new Map();
let previewPinchStart = null;
let previewPanPoint = null;
function setPreviewZoom(nextZoom, focalPoint) {
  if (!previewImageStage || !previewImage?.naturalWidth || !previewImage.naturalHeight) return;
  const stage = previewImageStage;
  const stageRect = stage.getBoundingClientRect();
  const focus = focalPoint || { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
  const oldWidth = previewImage.getBoundingClientRect().width || 1;
  const oldHeight = previewImage.getBoundingClientRect().height || 1;
  const oldLeft = Math.max((stage.clientWidth - oldWidth) / 2, 0);
  const oldTop = Math.max((stage.clientHeight - oldHeight) / 2, 0);
  const sourceX = Math.max(0, Math.min(1, (stage.scrollLeft + focus.x - oldLeft) / oldWidth));
  const sourceY = Math.max(0, Math.min(1, (stage.scrollTop + focus.y - oldTop) / oldHeight));
  previewZoom = Math.max(1, Math.min(4, nextZoom));
  const fitScale = Math.min(stage.clientWidth / previewImage.naturalWidth, stage.clientHeight / previewImage.naturalHeight);
  const width = Math.max(1, previewImage.naturalWidth * fitScale * previewZoom);
  const height = Math.max(1, previewImage.naturalHeight * fitScale * previewZoom);
  previewImage.style.width = `${width}px`;
  previewImage.style.height = `${height}px`;
  if (previewZoom === 1) {
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
  } else {
    const newLeft = Math.max((stage.clientWidth - width) / 2, 0);
    const newTop = Math.max((stage.clientHeight - height) / 2, 0);
    stage.scrollLeft = newLeft + sourceX * width - focus.x;
    stage.scrollTop = newTop + sourceY * height - focus.y;
  }
  if (previewZoomRange) previewZoomRange.value = previewZoom.toFixed(1);
  if (previewZoomValue) previewZoomValue.value = `${Math.round(previewZoom * 100)}%`;
}
function resetPreviewZoom() {
  setPreviewZoom(1);
  if (previewImageStage) {
    previewImageStage.scrollLeft = 0;
    previewImageStage.scrollTop = 0;
  }
}
previewImage?.addEventListener("load", resetPreviewZoom);
$("#previewZoomIn")?.addEventListener("click", () => setPreviewZoom(previewZoom + 0.25));
$("#previewZoomOut")?.addEventListener("click", () => setPreviewZoom(previewZoom - 0.25));
$("#previewZoomReset")?.addEventListener("click", resetPreviewZoom);
previewZoomRange?.addEventListener("input", () => setPreviewZoom(Number(previewZoomRange.value)));
previewImageStage?.addEventListener("wheel", event => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  const rect = previewImageStage.getBoundingClientRect();
  setPreviewZoom(previewZoom + (event.deltaY < 0 ? 0.1 : -0.1), {x:event.clientX - rect.left, y:event.clientY - rect.top});
}, {passive:false});
previewImageStage?.addEventListener("pointerdown", event => {
  previewImageStage.setPointerCapture(event.pointerId);
  previewPointers.set(event.pointerId, {x:event.clientX, y:event.clientY});
  if (previewPointers.size === 2) {
    const [first, second] = [...previewPointers.values()];
    previewPinchStart = {distance:Math.hypot(second.x-first.x, second.y-first.y), zoom:previewZoom};
    previewPanPoint = null;
  } else {
    previewPanPoint = {x:event.clientX, y:event.clientY};
  }
});
previewImageStage?.addEventListener("pointermove", event => {
  if (!previewPointers.has(event.pointerId)) return;
  previewPointers.set(event.pointerId, {x:event.clientX, y:event.clientY});
  if (previewPointers.size >= 2 && previewPinchStart) {
    const [first, second] = [...previewPointers.values()];
    const distance = Math.hypot(second.x-first.x, second.y-first.y);
    const rect = previewImageStage.getBoundingClientRect();
    setPreviewZoom(previewPinchStart.zoom * distance / Math.max(1, previewPinchStart.distance), {
      x:(first.x+second.x)/2-rect.left,
      y:(first.y+second.y)/2-rect.top
    });
  } else if (previewPanPoint && previewZoom > 1) {
    previewImageStage.scrollLeft -= event.clientX - previewPanPoint.x;
    previewImageStage.scrollTop -= event.clientY - previewPanPoint.y;
    previewPanPoint = {x:event.clientX, y:event.clientY};
  }
});
function endPreviewPointer(event) {
  previewPointers.delete(event.pointerId);
  previewPinchStart = null;
  previewPanPoint = previewPointers.size === 1 ? [...previewPointers.values()][0] : null;
}
previewImageStage?.addEventListener("pointerup", endPreviewPointer);
previewImageStage?.addEventListener("pointercancel", endPreviewPointer);
window.addEventListener("resize", () => {
  if (modal?.classList.contains("open")) setPreviewZoom(previewZoom);
});
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
  resetPreviewZoom();
  document.body.style.overflow = "hidden";
}
function closePreview() {
  modal?.classList.remove("open");
  document.body.style.overflow = "";
}
projectGrid?.addEventListener("click", event => {
  const card = event.target.closest(".project-card");
  if (card) openPreview(card.dataset.image, card.dataset.title);
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
videoCardRow?.addEventListener("click", event => {
  const card = event.target.closest(".video-card");
  if (card) openVideoPreview(card);
});
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
function positionBackToTop() {
  if (!musicPlayer || !backToTop) return;
  const panel = musicPlayer.getBoundingClientRect();
  backToTop.style.setProperty("--back-to-top-x", `${panel.left + panel.width / 2}px`);
  backToTop.style.setProperty("--back-to-top-y", `${panel.top - backToTop.offsetHeight - 12}px`);
}
if (musicPlayer && backToTop && "ResizeObserver" in window) {
  new ResizeObserver(positionBackToTop).observe(musicPlayer);
}
window.addEventListener("resize", positionBackToTop);
positionBackToTop();
const canvas = $("#visualizerCanvas");
const playBtn = $("#musicPlay");
const nextBtn = $("#musicNext");
const prevBtn = $("#musicPrev");
const title = $("#musicTitle");
const volumeControl = $("#volumeControl");
const volumeValue = $("#volumeValue");
const ctx = canvas?.getContext("2d");

let playlist = [];

let currentTrack = 0;
let audioContext = null;
let analyser = null;
let source = null;
let musicFadeGain = null;
let dataArray = null;
let fadeOutTrackSource = "";
let pauseFadeTimer = 0;
let playbackRequestId = 0;
const MUSIC_FADE_SECONDS = 1.6;
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
  const track = playlist[currentTrack];
  fadeOutTrackSource = "";
  if (musicLoadIndicator) musicLoadIndicator.hidden = false;
  updateMusicLoadProgress();
  audio.src = `${track.url}?v=${track.modified}`;
  audio.load();
  if (title) {
    title.textContent = track.relativePath.split("/").pop().replace(/\.[^/.]+$/, "");
    title.classList.remove("scrolling");
    requestAnimationFrame(() => {
      if (title.scrollWidth > title.clientWidth) title.classList.add("scrolling");
    });
  }
}

function updateMusicPlaylist(tracks) {
  const currentPath = playlist[currentTrack]?.relativePath;
  playlist = tracks;
  const foundIndex = currentPath ? playlist.findIndex(track => track.relativePath === currentPath) : -1;
  if (!playlist.length) {
    audio?.pause();
    audio?.removeAttribute("src");
    audio?.load();
    if (title) title.textContent = "NO MUSIC FILES";
    if (playBtn) playBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (prevBtn) prevBtn.disabled = true;
    if (musicLoadIndicator) musicLoadIndicator.hidden = true;
    currentTrack = 0;
    return;
  }
  if (playBtn) playBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;
  if (prevBtn) prevBtn.disabled = false;
  if (foundIndex >= 0) {
    currentTrack = foundIndex;
    return;
  }
  currentTrack = 0;
  loadTrack(0);
}

function scheduleMusicGain(value, duration) {
  if (!musicFadeGain || !audioContext) return;
  const gain = musicFadeGain.gain;
  const now = audioContext.currentTime;
  if (typeof gain.cancelAndHoldAtTime === "function") gain.cancelAndHoldAtTime(now);
  else {
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
  }
  gain.linearRampToValueAtTime(value, now + Math.max(0.01, duration));
}

function fadeMusicIn() {
  if (!musicFadeGain || !audioContext) return;
  const gain = musicFadeGain.gain;
  const now = audioContext.currentTime;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(0, now);
  gain.linearRampToValueAtTime(1, now + MUSIC_FADE_SECONDS);
  fadeOutTrackSource = "";
}

function fadeMusicOutNearEnd() {
  if (!audio || !musicFadeGain || !Number.isFinite(audio.duration)) return;
  const remaining = audio.duration - audio.currentTime;
  if (remaining > MUSIC_FADE_SECONDS || remaining <= 0 || fadeOutTrackSource === audio.currentSrc) return;
  fadeOutTrackSource = audio.currentSrc;
  scheduleMusicGain(0, remaining);
}

function pauseMusicWithFade() {
  if (!audio) return;
  const requestId = ++playbackRequestId;
  if (audio.paused || !musicFadeGain || !audioContext) {
    audio.pause();
    return;
  }
  scheduleMusicGain(0, 0.55);
  window.clearTimeout(pauseFadeTimer);
  pauseFadeTimer = window.setTimeout(() => {
    if (requestId === playbackRequestId) audio.pause();
  }, 580);
}

function setupVisualizer() {
  if (audioContext || !audio || !ctx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext = new AudioContextClass();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;
  musicFadeGain = audioContext.createGain();
  musicFadeGain.gain.value = 1;
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(musicFadeGain);
  musicFadeGain.connect(audioContext.destination);
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
  window.clearTimeout(pauseFadeTimer);
  const requestId = ++playbackRequestId;
  try {
    setupVisualizer();
    if (audioContext?.state === "suspended") await audioContext.resume();
    if (requestId !== playbackRequestId) return;
    fadeMusicIn();
    await audio.play();
  } catch (error) {
    console.warn("Music playback failed:", error);
  }
}

function toggleMusic() {
  if (!audio) return;
  if (audio.paused) playMusic();
  else pauseMusicWithFade();
}

playBtn?.addEventListener("click", toggleMusic);
nextBtn?.addEventListener("click", async () => { loadTrack(currentTrack + 1); await playMusic(); });
prevBtn?.addEventListener("click", async () => { loadTrack(currentTrack - 1); await playMusic(); });
audio?.addEventListener("ended", async () => { loadTrack(currentTrack + 1); await playMusic(); });
audio?.addEventListener("timeupdate", fadeMusicOutNearEnd);
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

renderVisualizer();
