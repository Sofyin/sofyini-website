const scroller = document.getElementById("scroller");
const scenes = [...document.querySelectorAll(".scene")];
const current = document.getElementById("current");
const cursor = document.querySelector(".cursor");

if (scroller && scenes.length) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

                if (current) {
                    current.textContent =
                        String(scenes.indexOf(entry.target) + 1)
                        .padStart(2, "0");
                }

            }

        });

    }, {
        root: scroller,
        threshold: 0.55
    });


    scenes.forEach((scene) => {
        observer.observe(scene);
    });

}

document.addEventListener("keydown", (e) => {

    if (
        ["ArrowDown", "PageDown", "ArrowUp", "PageUp", " "]
        .includes(e.key)
    ) {

        e.preventDefault();

        const active =
            Math.max(
                0,
                scenes.findIndex((scene) =>
                    scene.classList.contains("active")
                )
            );

        const dir =
            (e.key === "ArrowUp" || e.key === "PageUp")
                ? -1
                : 1;

        const next =
            Math.max(
                0,
                Math.min(
                    scenes.length - 1,
                    active + dir
                )
            );

        scenes[next].scrollIntoView({
            behavior: "smooth"
        });

    }

});

if (cursor) {

    document.addEventListener("mousemove", (e) => {

        cursor.style.transform =
            `translate3d(${e.clientX}px, ${e.clientY}px, 0)
             translate3d(-50%, -50%, 0)`;

    });


    document
        .querySelectorAll("a, .work-card, .art-item, button")
        .forEach((el) => {

            el.addEventListener("mouseenter", () => {
                cursor.classList.add("view");
            });

            el.addEventListener("mouseleave", () => {
                cursor.classList.remove("view");
            });

        });

}

if (scenes[0]) {
    scenes[0].classList.add("active");
}

const projectPreview =
    document.getElementById("projectPreview");

const previewImage =
    document.getElementById("previewImage");

const previewTitle =
    document.getElementById("previewTitle");

const previewClose =
    document.getElementById("previewClose");


let previewIsOpen = false;

let previewHistoryState = false;

function openPreview(image, title) {

    if (
        !projectPreview ||
        !previewImage ||
        !previewTitle
    ) {
        return;
    }


    previewImage.src = image;
    previewImage.alt = title;

    previewTitle.textContent = title;


    projectPreview.classList.add("active");

    document.body.style.overflow = "hidden";

    previewIsOpen = true;

    if (!previewHistoryState) {

        history.pushState(
            {
                preview: true
            },
            "",
            window.location.href
        );

        previewHistoryState = true;

    }

}

function closePreview(fromBrowserBack = false) {

    if (!previewIsOpen) {
        return;
    }


    if (projectPreview) {
        projectPreview.classList.remove("active");
    }


    document.body.style.overflow = "";

    previewIsOpen = false;

    if (
        !fromBrowserBack &&
        previewHistoryState
    ) {

        previewHistoryState = false;

        history.back();

    }

    else {

        previewHistoryState = false;

    }

}

document
    .querySelectorAll(".work-card")
    .forEach((card) => {

        card.addEventListener("click", () => {

            const image =
                card.getAttribute("data-image");

            const title =
                card.getAttribute("data-title");

            openPreview(image, title);

        });

    });

document
    .querySelectorAll(".art-item")
    .forEach((art) => {

        art.addEventListener("click", () => {

            const image =
                art.getAttribute("data-image");

            const title =
                art.getAttribute("data-title");

            openPreview(image, title);

        });

    });

if (previewClose) {

    previewClose.addEventListener("click", (e) => {

        e.stopPropagation();

        closePreview(false);

    });

}

if (projectPreview) {

    projectPreview.addEventListener("click", (e) => {

        if (e.target === projectPreview) {

            closePreview(false);

        }

    });

}

window.addEventListener("popstate", () => {

    if (previewIsOpen) {

        closePreview(true);

    }

});


document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && previewIsOpen) {

        closePreview(false);

    }

});

const loadingScreen =
    document.getElementById("loading-screen");

const introMessage =
    document.getElementById("introMessage");

const introContinue =
    document.getElementById("introContinue");


const introSteps = [
    "OH, A GUEST.",
    "HI:).",
    "LET'S GET STARTED"
];


let introIndex = 0;

function showIntro() {

    if (!introMessage || !introContinue) {
        return;
    }


    introMessage.classList.remove("show");
    introContinue.classList.remove("show");


    setTimeout(() => {

        introMessage.textContent =
            introSteps[introIndex];

        introMessage.classList.add("show");


        setTimeout(() => {

            introContinue.classList.add("show");

        }, 700);

    }, 400);

}

if (loadingScreen) {

    loadingScreen.addEventListener("click", () => {

        if (introMessage) {
            introMessage.classList.remove("show");
        }

        if (introContinue) {
            introContinue.classList.remove("show");
        }


        setTimeout(() => {

            introIndex++;


            if (
                introIndex <
                introSteps.length
            ) {

                showIntro();

            }

            else {

                loadingScreen.classList.add("finished");

            }

        }, 500);

    });


    showIntro();

}

const seeMoreBtn =
    document.getElementById("seeMoreBtn");

const seeLessBtn =
    document.getElementById("seeLessBtn");

const artArchive =
    document.getElementById("artArchive");

if (
    seeMoreBtn &&
    artArchive
) {

    seeMoreBtn.addEventListener("click", () => {

        artArchive.classList.add("open");

        seeMoreBtn.style.display = "none";


        setTimeout(() => {

            artArchive.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    });

}


if (
    seeLessBtn &&
    artArchive
) {

    seeLessBtn.addEventListener("click", () => {

        artArchive.classList.remove("open");


        setTimeout(() => {

            seeMoreBtn.style.display = "flex";

            seeMoreBtn.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 500);

    });

}
