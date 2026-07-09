(function () {
    'use strict';

    const FORM_ENDPOINT = '/api/contact';

    const SERVICE_LABELS = {
        violista: 'Violista',
        dj: 'DJ',
        producer: 'Producer',
        stage_manager: 'Stage Manager',
        tecnico_suono: 'Tecnico del suono'
    };

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
        const label = btn.querySelector('[data-btn-label]');
        const loadingLabel = btn.querySelector('[data-btn-loading]');
        if (label) label.hidden = loading;
        if (loadingLabel) loadingLabel.hidden = !loading;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        hideStatus(form);

        if (form.querySelector('[name="_gotcha"]')?.value) {
            return;
        }

        const servizi = getSelectedServices(form);
        const privacy = form.querySelector('[name="privacy"]');

        if (!form.nome.value.trim()) {
            showStatus(form, 'error', 'Inserisci il tuo nome.');
            return;
        }

        if (!form.email.value.trim() || !form.email.checkValidity()) {
            showStatus(form, 'error', 'Inserisci un indirizzo email valido.');
            return;
        }

        if (!servizi.length) {
            showStatus(form, 'error', 'Seleziona almeno un servizio richiesto.');
            return;
        }

        if (!form.messaggio.value.trim() || form.messaggio.value.trim().length < 10) {
            showStatus(form, 'error', 'Il messaggio deve contenere almeno 10 caratteri.');
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
            privacy: true
        };

        setLoading(form, true);

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Invio non riuscito. Riprova.');
            }

            form.reset();
            showStatus(form, 'success', 'Richiesta inviata con successo. Ti risponderò al più presto.');
        } catch (err) {
            showStatus(form, 'error', err.message || 'Errore di connessione. Riprova o scrivi a danielcalzonelive@gmail.com.');
        } finally {
            setLoading(form, false);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('quoteForm');
        form?.addEventListener('submit', handleSubmit);
    });
})();