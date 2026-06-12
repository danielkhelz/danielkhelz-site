"use strict";

/* --- Menu mobile --------------------------------------------------------- */

const navToggle = document.querySelector(".nav__toggle");
const mobileMenu = document.getElementById("mobileMenu");

navToggle.addEventListener("click", () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Chiudi menu mobile" : "Apri menu mobile");
});

mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
    });
});

/* --- Reveal on scroll ------------------------------------------------------ */

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* --- Link di navigazione attivo --------------------------------------------- */

const navLinks = document.querySelectorAll(".nav__link");
const sections = [...navLinks].map((link) =>
    document.getElementById(link.dataset.section)
).filter(Boolean);

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) =>
                link.classList.toggle("is-active", link.dataset.section === entry.target.id)
            );
        });
    },
    { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

/* --- Galleria foto (lightbox) ------------------------------------------------ */

const galleryModal = document.getElementById("galleryModal");
const modalImage = document.getElementById("modalImage");
const galleryItems = [...document.querySelectorAll("[data-gallery-index]")];
let galleryIndex = 0;

function showPhoto(index) {
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const img = galleryItems[galleryIndex].querySelector("img");
    modalImage.src = img.src;
    modalImage.alt = img.alt;
}

function openGallery(index) {
    showPhoto(index);
    galleryModal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeGallery() {
    galleryModal.hidden = true;
    document.body.style.overflow = "";
}

galleryItems.forEach((item) => {
    const open = () => openGallery(Number(item.dataset.galleryIndex));
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    });
});

document.querySelector("[data-close-gallery]").addEventListener("click", closeGallery);
document.querySelector("[data-prev-gallery]").addEventListener("click", () => showPhoto(galleryIndex - 1));
document.querySelector("[data-next-gallery]").addEventListener("click", () => showPhoto(galleryIndex + 1));
galleryModal.addEventListener("click", (e) => {
    if (!e.target.closest("[data-stop-propagation]")) closeGallery();
});

/* --- Modal video --------------------------------------------------------------- */

const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const videoItems = [...document.querySelectorAll("[data-video-index]")];

function openVideo(index) {
    const video = videoItems[index].querySelector("video");
    modalVideo.src = video.src;
    videoModal.hidden = false;
    document.body.style.overflow = "hidden";
    modalVideo.play().catch(() => {});
}

function closeVideo() {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    videoModal.hidden = true;
    document.body.style.overflow = "";
}

videoItems.forEach((item) => {
    const open = () => openVideo(Number(item.dataset.videoIndex));
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    });

    const preview = item.querySelector(".preview-video");
    item.addEventListener("mouseenter", () => preview.play().catch(() => {}));
    item.addEventListener("mouseleave", () => {
        preview.pause();
        preview.currentTime = 0;
    });
});

document.querySelector("[data-close-video]").addEventListener("click", closeVideo);
videoModal.addEventListener("click", (e) => {
    if (!e.target.closest("[data-stop-propagation]")) closeVideo();
});

/* --- Tastiera: Esc e frecce ------------------------------------------------------ */

document.addEventListener("keydown", (e) => {
    if (!videoModal.hidden && e.key === "Escape") {
        closeVideo();
        return;
    }
    if (galleryModal.hidden) return;
    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowLeft") showPhoto(galleryIndex - 1);
    if (e.key === "ArrowRight") showPhoto(galleryIndex + 1);
});

/* --- Scroll to top ----------------------------------------------------------------- */

const scrollTopBtn = document.querySelector("[data-scroll-top]");

window.addEventListener("scroll", () => {
    scrollTopBtn.hidden = window.scrollY < 600;
}, { passive: true });

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
