const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

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
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => a.classList.toggle("active", a.dataset.section === id));
    if (subbarLabel) subbarLabel.textContent = sectionNames[id] || "SOFYINI ARCHIVE";
    subLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  });
}, {threshold: 0.5});
sections.forEach(section => observer.observe(section));

// Mobile nav
const menuToggle = $("#menuToggle");
const mainNav = $(".main-nav");
menuToggle?.addEventListener("click", () => mainNav.classList.toggle("show"));
navLinks.forEach(link => link.addEventListener("click", () => mainNav?.classList.remove("show")));

// Hero ability selector
const abilityContent = {
  design: ["VISUAL DESIGN", "Building visual identities, compositions and graphic experiments with a strong sense of form."],
  art: ["DIGITAL ART", "Exploring digital illustration, image manipulation and expressive visual storytelling."],
  photo: ["UI/UX", "stands for User Interface (UI) and User Experience (UX), two distinct yet closely connected phases of designing digital products like apps and websites. "]
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
  e.currentTarget.innerHTML = opened ? 'CLOSE ART ARCHIVE <b>−</b>' : 'OPEN ART ARCHIVE <b>＋</b>';
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
$("#settingsTrigger")?.addEventListener("click", () => drawer.classList.toggle("open"));
$("#settingsClose")?.addEventListener("click", () => drawer.classList.remove("open"));

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

// Audio — requires assets/music.mp3
const audio = $("#bgMusic");
const audioButton = $("#audioToggle");
let audioOn = false;
audioButton?.addEventListener("click", async () => {
  if (!audio) return;
  if (!audioOn) {
    try {
      audio.volume = 0.35;
      await audio.play();
      audioOn = true;
      audioButton.textContent = "ON";
      audioButton.classList.add("active");
    } catch (error) {
      audioButton.textContent = "RETRY";
      console.warn("Audio playback failed:", error);
    }
  } else {
    audio.pause();
    audioOn = false;
    audioButton.textContent = "OFF";
    audioButton.classList.remove("active");
  }
});
