const scroller=document.getElementById('scroller');
const scenes=[...document.querySelectorAll('.scene')];
const current=document.getElementById('current');
const cursor=document.querySelector('.cursor');

const observer=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
   entry.target.classList.add('active');
   current.textContent=String(scenes.indexOf(entry.target)+1).padStart(2,'0');
  }
 });
},{root:scroller,threshold:.55});
scenes.forEach(s=>observer.observe(s));

document.addEventListener('keydown',e=>{
 if(['ArrowDown','PageDown','ArrowUp','PageUp',' '].includes(e.key)){
  e.preventDefault();
  const active=Math.max(0,scenes.findIndex(s=>s.classList.contains('active')));
  const dir=(e.key==='ArrowUp'||e.key==='PageUp')?-1:1;
  const next=Math.max(0,Math.min(scenes.length-1,active+dir));
  scenes[next].scrollIntoView({behavior:'smooth'});
 }
});

document.addEventListener("mousemove", (e) => {
    cursor.style.transform =
        `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
});
document.querySelectorAll('a,.work-card').forEach(el=>{
 el.addEventListener('mouseenter',()=>cursor.classList.add('view'));
 el.addEventListener('mouseleave',()=>cursor.classList.remove('view'));
});
scenes[0].classList.add('active');

const workCards = document.querySelectorAll(".work-card");

workCards.forEach((card) => {
    card.addEventListener("click", function () {
        const image = this.getAttribute("data-image");
        const title = this.getAttribute("data-title");

        // Cek apakah modal tersedia
        const projectPreview = document.getElementById("projectPreview");
        const previewImage = document.getElementById("previewImage");
        const previewTitle = document.getElementById("previewTitle");

        if (!projectPreview || !previewImage || !previewTitle) {
            console.error("Preview modal belum ditemukan di HTML.");
            return;
        }

        previewImage.src = image;
        previewImage.alt = title;
        previewTitle.textContent = title;

        projectPreview.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});

const previewClose = document.getElementById("previewClose");
const projectPreview = document.getElementById("projectPreview");

function closePreview() {
    if (!projectPreview) return;

    projectPreview.classList.remove("active");
    document.body.style.overflow = "";
}

if (previewClose) {
    previewClose.addEventListener("click", closePreview);
}

if (projectPreview) {
    projectPreview.addEventListener("click", function (e) {
        if (e.target === projectPreview) {
            closePreview();
        }
    });
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closePreview();
    }
});

const loadingScreen = document.getElementById("loading-screen");
const introMessage = document.getElementById("introMessage");
const introContinue = document.getElementById("introContinue");

const introSteps = [
    "OH, A GUEST.",
    "HI:).",
    "LET'S GET STARTED"
];

let introIndex = 0;

function showIntro() {
    introMessage.classList.remove("show");
    introContinue.classList.remove("show");

    setTimeout(() => {
        introMessage.textContent = introSteps[introIndex];
        introMessage.classList.add("show");

        setTimeout(() => {
            introContinue.classList.add("show");
        }, 700);
    }, 400);
}

loadingScreen.addEventListener("click", () => {
    introMessage.classList.remove("show");
    introContinue.classList.remove("show");

    setTimeout(() => {
        introIndex++;

        if (introIndex < introSteps.length) {
            showIntro();
        } else {
            loadingScreen.classList.add("finished");
        }
    }, 500);
});

showIntro();

/* =========================================================
   SEE MORE / SEE LESS
========================================================= */

const seeMoreBtn = document.getElementById("seeMoreBtn");
const seeLessBtn = document.getElementById("seeLessBtn");
const artArchive = document.getElementById("artArchive");


if (seeMoreBtn && artArchive) {

    seeMoreBtn.addEventListener("click", () => {

        artArchive.classList.add("open");

        seeMoreBtn.style.display = "none";

        // Tunggu animasi mulai,
        // lalu scroll sedikit ke area ART
        setTimeout(() => {

            artArchive.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    });

}


if (seeLessBtn && artArchive) {

    seeLessBtn.addEventListener("click", () => {

        artArchive.classList.remove("open");

        // Munculkan kembali SEE MORE
        setTimeout(() => {

            seeMoreBtn.style.display = "flex";

            seeMoreBtn.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 500);

    });

}
