(function () {
    'use strict';

    const galleryImages = [
        { src: 'images/photo1.jpg', alt: 'Daniel Khelz in maglietta nera con cuffie mentre mixa su controller Pioneer in studio con muro di mattoni a vista' },
        { src: 'images/photo2.jpg', alt: 'Daniel Khelz in completo nero con cuffie mentre mixa in elegante bar con scaffali pieni di bottiglie di liquori' }
    ];

    const galleryVideos = [
        'videos/video1.mp4',
        'videos/video2.mp4'
    ];

    let currentGalleryIndex = 0;

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function toggleMobileMenu() {
        const menu = $('#mobileMenu');
        const button = $('button[aria-controls="mobileMenu"]');
        const icon = button?.querySelector('.hamburger-icon');
        const isOpen = menu.classList.contains('open');

        menu.classList.toggle('open', !isOpen);
        menu.classList.toggle('hidden', isOpen);
        button?.setAttribute('aria-expanded', String(!isOpen));
        icon?.classList.toggle('open', !isOpen);
        document.body.classList.toggle('modal-open', !isOpen);
    }

    function closeMobileMenu() {
        const menu = $('#mobileMenu');
        const button = $('button[aria-controls="mobileMenu"]');
        menu?.classList.remove('open');
        menu?.classList.add('hidden');
        button?.setAttribute('aria-expanded', 'false');
        button?.querySelector('.hamburger-icon')?.classList.remove('open');
        document.body.classList.remove('modal-open');
    }

    function openGalleryModal(index) {
        currentGalleryIndex = index;
        const modal = $('#galleryModal');
        const img = $('#modalImage');
        const item = galleryImages[index];
        img.src = item.src;
        img.alt = item.alt;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('modal-open');
    }

    function closeGalleryModal() {
        const modal = $('#galleryModal');
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    function prevGalleryImage(e) {
        e?.stopImmediatePropagation();
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        const item = galleryImages[currentGalleryIndex];
        const img = $('#modalImage');
        img.src = item.src;
        img.alt = item.alt;
    }

    function nextGalleryImage(e) {
        e?.stopImmediatePropagation();
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        const item = galleryImages[currentGalleryIndex];
        const img = $('#modalImage');
        img.src = item.src;
        img.alt = item.alt;
    }

    function openVideoModal(index) {
        const modal = $('#videoModal');
        const video = $('#modalVideo');

        video.pause();
        video.removeAttribute('src');
        video.load();
        video.src = galleryVideos[index];
        video.muted = false;
        video.load();

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('modal-open');

        video.onloadedmetadata = () => {
            video.play().catch(() => {});
        };
    }

    function closeVideoModal() {
        const modal = $('#videoModal');
        const video = $('#modalVideo');
        video.pause();
        video.removeAttribute('src');
        video.load();
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    function initScrollSpy() {
        const sections = $$('section[id], header[id]');
        const navLinks = $$('.nav-link[data-section]');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.dataset.section === id);
                        });
                    }
                });
            },
            { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    function initRevealAnimations() {
        const elements = $$('.reveal');
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );

        elements.forEach((el) => observer.observe(el));
    }

    function initPreviewVideos() {
        const previews = $$('.preview-video');
        if (!previews.length) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.3 }
        );

        previews.forEach((video) => observer.observe(video));
    }

    function initNavScroll() {
        const nav = $('.site-nav');
        const scrollTop = $('[data-scroll-top]');
        if (!nav) return;

        let ticking = false;

        function onScroll() {
            const y = window.scrollY;
            nav.classList.toggle('scrolled', y > 40);
            scrollTop?.classList.toggle('visible', y > 500);
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        onScroll();
    }

    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            const imgModal = $('#galleryModal');
            const vidModal = $('#videoModal');

            if (e.key === 'Escape') {
                if (!vidModal.classList.contains('hidden')) closeVideoModal();
                else if (!imgModal.classList.contains('hidden')) closeGalleryModal();
                else {
                    const menu = $('#mobileMenu');
                    if (menu?.classList.contains('open')) closeMobileMenu();
                }
            }

            if (!imgModal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') prevGalleryImage();
                else if (e.key === 'ArrowRight') nextGalleryImage();
            }
        });
    }

    function initGalleryTriggers() {
        $$('[data-gallery-index]').forEach((el) => {
            const index = Number(el.dataset.galleryIndex);
            const open = () => openGalleryModal(index);

            el.addEventListener('click', open);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        });

        $$('[data-video-index]').forEach((el) => {
            const index = Number(el.dataset.videoIndex);
            const open = () => openVideoModal(index);

            el.addEventListener('click', open);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        });
    }

    function initEventListeners() {
        $('button[aria-controls="mobileMenu"]')?.addEventListener('click', toggleMobileMenu);
        $$('#mobileMenu a').forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        $('#galleryModal')?.addEventListener('click', closeGalleryModal);
        $('#galleryModal [data-stop-propagation]')?.addEventListener('click', (e) => e.stopImmediatePropagation());
        $('[data-close-gallery]')?.addEventListener('click', closeGalleryModal);
        $('[data-prev-gallery]')?.addEventListener('click', prevGalleryImage);
        $('[data-next-gallery]')?.addEventListener('click', nextGalleryImage);

        $('#videoModal')?.addEventListener('click', closeVideoModal);
        $('#videoModal [data-stop-propagation]')?.addEventListener('click', (e) => e.stopImmediatePropagation());
        $('[data-close-video]')?.addEventListener('click', closeVideoModal);

        $('[data-scroll-top]')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) closeMobileMenu();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initEventListeners();
        initGalleryTriggers();
        initScrollSpy();
        initRevealAnimations();
        initPreviewVideos();
        initKeyboardNav();
        initNavScroll();
    });
})();