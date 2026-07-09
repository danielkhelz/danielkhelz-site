(function () {
    'use strict';

    const SERVICE_LABELS = {
        violista: 'Violista',
        dj: 'DJ',
        producer: 'Producer',
        stage_manager: 'Stage Manager',
        tecnico_suono: 'Tecnico del suono'
    };

    const EVENT_LABELS = {
        concerto: 'Concerto',
        evento_privato: 'Evento privato',
        festival: 'Festival',
        registrazione: 'Registrazione in studio',
        corporate: 'Evento corporate',
        altro: 'Altro'
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

    function validateForm(form) {
        const servizi = getSelectedServices(form);
        const privacy = form.querySelector('[name="privacy"]');

        if (!form.nome.value.trim()) {
            showStatus(form, 'error', 'Inserisci il tuo nome.');
            return false;
        }

        if (!form.email.value.trim() || !form.email.checkValidity()) {
            showStatus(form, 'error', 'Inserisci un indirizzo email valido.');
            return false;
        }

        if (!servizi.length) {
            showStatus(form, 'error', 'Seleziona almeno un servizio richiesto.');
            return false;
        }

        if (!form.messaggio.value.trim() || form.messaggio.value.trim().length < 10) {
            showStatus(form, 'error', 'Il messaggio deve contenere almeno 10 caratteri.');
            return false;
        }

        if (!privacy?.checked) {
            showStatus(form, 'error', 'Devi accettare l\'informativa privacy.');
            return false;
        }

        return true;
    }

    function prepareFormData(form) {
        const servizi = getSelectedServices(form)
            .map((key) => SERVICE_LABELS[key] || key)
            .join(', ');

        const serviziField = form.querySelector('#serviziRichiesti');
        if (serviziField) serviziField.value = servizi;

        const tipoEvento = form.tipo_evento.value;
        const tipoLabel = EVENT_LABELS[tipoEvento] || tipoEvento || 'Non specificato';

        let tipoInput = form.querySelector('input[name="tipo_evento_label"]');
        if (!tipoInput) {
            tipoInput = document.createElement('input');
            tipoInput.type = 'hidden';
            tipoInput.name = 'tipo_evento_label';
            form.appendChild(tipoInput);
        }
        tipoInput.value = tipoLabel;
    }

    function handleSubmit(event) {
        const form = event.currentTarget;
        hideStatus(form);

        if (form.querySelector('[name="_honey"]')?.value) {
            event.preventDefault();
            return;
        }

        if (!validateForm(form)) {
            event.preventDefault();
            return;
        }

        prepareFormData(form);
        setLoading(form, true);
    }

    function handleSuccessRedirect() {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('inviato')) return;

        const form = document.getElementById('quoteForm');
        if (form) {
            showStatus(form, 'success', 'Richiesta inviata con successo. Ti risponderò al più presto.');
        }

        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('quoteForm');
        form?.addEventListener('submit', handleSubmit);
        handleSuccessRedirect();
    });
})();