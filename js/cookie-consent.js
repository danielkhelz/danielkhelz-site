(function () {
    'use strict';

    const STORAGE_KEY = 'dk_cookie_consent';
    const CONSENT_VERSION = '1';

    function getConsent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.version !== CONSENT_VERSION) return null;
            return data;
        } catch {
            return null;
        }
    }

    function setConsent(accepted) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: CONSENT_VERSION,
            accepted: Boolean(accepted),
            timestamp: new Date().toISOString()
        }));
    }

    function clearConsent() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function showBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        banner.classList.remove('hidden');
        banner.classList.add('visible');
    }

    function hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (!banner) return;
        banner.classList.remove('visible');
        banner.classList.add('hidden');
    }

    function createEmbedPlaceholder(container, label, externalUrl) {
        if (container.querySelector('.embed-placeholder')) return;

        const placeholder = document.createElement('div');
        placeholder.className = 'embed-placeholder';
        placeholder.innerHTML =
            '<div class="embed-placeholder-inner">' +
                '<i class="fa-solid fa-lock" aria-hidden="true"></i>' +
                '<p class="embed-placeholder-title">Contenuto di terze parti</p>' +
                '<p class="embed-placeholder-text">Per visualizzare ' + label + ' è necessario accettare i cookie non necessari.</p>' +
                '<button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept-inline>Accetta e carica</button>' +
                (externalUrl ? '<a href="' + externalUrl + '" target="_blank" rel="noopener noreferrer" class="embed-placeholder-link">Apri su ' + label + ' <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>' : '') +
            '</div>';

        container.appendChild(placeholder);

        placeholder.querySelector('[data-cookie-accept-inline]')?.addEventListener('click', () => {
            setConsent(true);
            hideBanner();
            loadThirdPartyEmbeds();
        });
    }

    function loadThirdPartyEmbeds() {
        document.querySelectorAll('[data-embed-src]').forEach((el) => {
            const src = el.dataset.embedSrc;
            if (!src || el.getAttribute('src')) return;

            el.setAttribute('src', src);
            el.removeAttribute('data-embed-src');

            const container = el.closest('[data-embed-container]');
            container?.querySelector('.embed-placeholder')?.remove();
        });
    }

    function blockThirdPartyEmbeds() {
        document.querySelectorAll('[data-embed-container]').forEach((container) => {
            const iframe = container.querySelector('iframe[data-embed-src], iframe[src]');
            if (!iframe) return;

            if (iframe.getAttribute('src')) {
                iframe.dataset.embedSrc = iframe.getAttribute('src');
                iframe.removeAttribute('src');
            }

            const label = container.dataset.embedLabel || 'questo contenuto';
            const url = container.dataset.embedUrl || '';
            createEmbedPlaceholder(container, label, url);
        });
    }

    function applyConsent(consent) {
        if (consent?.accepted) {
            loadThirdPartyEmbeds();
        } else if (consent) {
            blockThirdPartyEmbeds();
        } else {
            blockThirdPartyEmbeds();
            showBanner();
        }
    }

    function acceptCookies() {
        setConsent(true);
        hideBanner();
        loadThirdPartyEmbeds();
    }

    function rejectCookies() {
        setConsent(false);
        hideBanner();
        blockThirdPartyEmbeds();
    }

    function resetConsent() {
        clearConsent();
        document.querySelectorAll('iframe[src]').forEach((iframe) => {
            iframe.dataset.embedSrc = iframe.getAttribute('src');
            iframe.removeAttribute('src');
        });
        document.querySelectorAll('.embed-placeholder').forEach((el) => el.remove());
        blockThirdPartyEmbeds();
        showBanner();
    }

    function initEventListeners() {
        document.querySelectorAll('[data-cookie-accept]').forEach((btn) => {
            btn.addEventListener('click', acceptCookies);
        });

        document.querySelectorAll('[data-cookie-reject]').forEach((btn) => {
            btn.addEventListener('click', rejectCookies);
        });

        document.querySelectorAll('[data-cookie-reset]').forEach((btn) => {
            btn.addEventListener('click', resetConsent);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initEventListeners();
        applyConsent(getConsent());
    });

    window.dkCookieConsent = {
        getConsent,
        accept: acceptCookies,
        reject: rejectCookies,
        reset: resetConsent
    };
})();