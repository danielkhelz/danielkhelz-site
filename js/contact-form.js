(function () {
    'use strict';

    const FORM_ENDPOINT = '/api/contact';
    const FALLBACK_EMAIL = 'danielcalzonelive@gmail.com';

    function showStatus(form, type, message) {
        const status = form.querySelector('[data-form-status]');
        if (!status) return;

        status.hidden = false;
        status.className = 'form-status form-status--' + type;
        status.textContent = message;
    }

    function hideStatus(form) {
        const status = form.querySelector('[data-form-status]');
        if (status) status.hidden = true;
    }

    function getSelectedServices(form) {
        return Array.from(form.querySelectorAll('input[name="servizi"]:checked')).map((el) => el.value);
    }

    function setLoading(form, loading) {
        const btn = form.querySelector('[type="submit"]');
        if (!btn) return;

        btn.disabled = loading;
        btn.classList.toggle('is-loading', loading);

        const label = btn.querySelector('[data-btn-label]');
        const loadingLabel = btn.querySelector('[data-btn-loading]');
        if (label) label.hidden = loading;
        if (loadingLabel) loadingLabel.hidden = !loading;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        hideStatus(form);

        const honeypot = form.querySelector('[name="_gotcha"]');
        if (honeypot && honeypot.value) {
            return;
        }

        const servizi = getSelectedServices(form);
        const privacy = form.querySelector('[name="privacy"]');

        if (!servizi.length) {
            showStatus(form, 'error', 'Seleziona almeno un servizio richiesto.');
            return;
        }

        if (!privacy?.checked) {
            showStatus(form, 'error', 'Devi accettare l\'informativa privacy.');
            return;
        }

        const payload = {
            nome: form.nome.value.trim(),
            email: form.email.value.trim(),
            telefono: form.telefono.value.trim(),
            servizi,
            tipo_evento: form.tipo_evento.value,
            data_evento: form.data_evento.value,
            luogo: form.luogo.value.trim(),
            messaggio: form.messaggio.value.trim(),
            privacy: true,
            _gotcha: ''
        };

        setLoading(form, true);

        try {
            let delivered = false;

            try {
                const sent = await submitPrimary(payload);
                if (sent.ok) {
                    delivered = true;
                } else if (![503, 404, 500].includes(sent.status)) {
                    throw new Error(sent.error || 'Invio non riuscito. Riprova.');
                }
            } catch (primaryErr) {
                if (primaryErr.message && !primaryErr.message.includes('fetch')) {
                    throw primaryErr;
                }
            }

            if (!delivered) {
                await submitFallback(payload);
            }

            form.reset();
            showStatus(form, 'success', 'Richiesta inviata. Ti risponderò al più presto.');
        } catch (err) {
            showStatus(form, 'error', err.message || 'Errore di connessione. Riprova o scrivi a ' + FALLBACK_EMAIL + '.');
        } finally {
            setLoading(form, false);
        }
    }

    async function submitPrimary(payload) {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        return {
            ok: response.ok,
            status: response.status,
            error: data.error
        };
    }

    async function submitFallback(payload) {
        const serviziLabel = payload.servizi.join(', ');

        const response = await fetch('https://formsubmit.co/ajax/' + FALLBACK_EMAIL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: 'Preventivo evento — ' + payload.nome,
                _template: 'table',
                _captcha: 'false',
                Nome: payload.nome,
                Email: payload.email,
                Telefono: payload.telefono || '—',
                Servizi: serviziLabel,
                'Tipo evento': payload.tipo_evento || '—',
                'Data evento': payload.data_evento || '—',
                Luogo: payload.luogo || '—',
                Messaggio: payload.messaggio
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Invio non riuscito. Riprova.');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('quoteForm');
        form?.addEventListener('submit', handleSubmit);
    });
})();